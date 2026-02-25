const db = require('../config/database');
const { generateSlug, AppError } = require('../utils/helpers');

const getAllContent = async (req, res) => {
  const { type, category, page = 1, limit = 10, premium } = req.query;
  const offset = (page - 1) * limit;

  let whereConditions = ['c.is_published = true'];
  let queryParams = [];
  let paramCount = 0;

  if (type) {
    paramCount++;
    whereConditions.push(`c.content_type = $${paramCount}`);
    queryParams.push(type);
  }

  if (category) {
    paramCount++;
    whereConditions.push(`cat.slug = $${paramCount}`);
    queryParams.push(category);
  }

  if (premium === 'false' || !req.user) {
    whereConditions.push('c.is_premium = false');
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `
    SELECT COUNT(*) 
    FROM content c
    LEFT JOIN categories cat ON c.category_id = cat.id
    ${whereClause}
  `;

  const countResult = await db.query(countQuery, queryParams);
  const total = parseInt(countResult.rows[0].count);

  // Get content with pagination
  queryParams.push(limit, offset);
  const contentQuery = `
    SELECT 
      c.*,
      p.username as creator_username,
      p.display_name as creator_display_name,
      p.avatar_url as creator_avatar,
      cat.name as category_name,
      cat.slug as category_slug,
      EXISTS(
        SELECT 1 FROM user_subscriptions us 
        WHERE us.user_id = $${paramCount + 3} 
        AND us.creator_id = c.creator_id 
        AND us.status = 'active'
        AND us.current_period_end > CURRENT_TIMESTAMP
      ) as has_access
    FROM content c
    LEFT JOIN profiles p ON c.creator_id = p.id
    LEFT JOIN categories cat ON c.category_id = cat.id
    ${whereClause}
    ORDER BY c.published_at DESC, c.created_at DESC
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `;

  queryParams.push(req.user?.id || null);

  const contentResult = await db.query(contentQuery, queryParams);

  res.json({
    content: contentResult.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

const getContentById = async (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      c.*,
      p.username as creator_username,
      p.display_name as creator_display_name,
      p.avatar_url as creator_avatar,
      p.bio as creator_bio,
      cat.name as category_name,
      cat.slug as category_slug,
      EXISTS(
        SELECT 1 FROM user_subscriptions us 
        WHERE us.user_id = $2 
        AND us.creator_id = c.creator_id 
        AND us.status = 'active'
        AND us.current_period_end > CURRENT_TIMESTAMP
      ) as has_access
    FROM content c
    LEFT JOIN profiles p ON c.creator_id = p.id
    LEFT JOIN categories cat ON c.category_id = cat.id
    WHERE c.id = $1 AND c.is_published = true
  `;

  const result = await db.query(query, [id, req.user?.id || null]);

  if (result.rows.length === 0) {
    throw new AppError('Content not found', 404);
  }

  const content = result.rows[0];

  // Check premium access
  if (content.is_premium && !content.has_access && req.user?.id !== content.creator_id) {
    throw new AppError('Premium content requires subscription', 403);
  }

  res.json({ content });
};

const createContent = async (req, res) => {
  const {
    title,
    description,
    content_type,
    content_text,
    video_url,
    audio_url,
    thumbnail_url,
    is_premium = false,
    is_published = false,
    category_id,
  } = req.body;

  if (!title || !content_type) {
    throw new AppError('Title and content type are required', 400);
  }

  const slug = generateSlug(title);

  // Check if slug already exists
  const existingSlug = await db.query('SELECT id FROM content WHERE slug = $1', [slug]);
  if (existingSlug.rows.length > 0) {
    throw new AppError('Content with this title already exists', 409);
  }

  const result = await db.query(
    `INSERT INTO content (
      creator_id, category_id, title, slug, description, content_type, 
      content_text, video_url, audio_url, thumbnail_url, is_premium, is_published,
      published_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *`,
    [
      req.user.id,
      category_id,
      title,
      slug,
      description,
      content_type,
      content_text,
      video_url,
      audio_url,
      thumbnail_url,
      is_premium,
      is_published,
      is_published ? new Date() : null,
    ]
  );

  res.status(201).json({
    message: 'Content created successfully',
    content: result.rows[0],
  });
};

const updateContent = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    content_text,
    video_url,
    audio_url,
    thumbnail_url,
    is_premium,
    is_published,
    category_id,
  } = req.body;

  // Verify content ownership
  const existingContent = await db.query(
    'SELECT id, creator_id FROM content WHERE id = $1',
    [id]
  );

  if (existingContent.rows.length === 0) {
    throw new AppError('Content not found', 404);
  }

  if (existingContent.rows[0].creator_id !== req.user.id) {
    throw new AppError('Not authorized to update this content', 403);
  }

  let slug;
  if (title) {
    slug = generateSlug(title);
    // Check if new slug conflicts with other content
    const slugCheck = await db.query(
      'SELECT id FROM content WHERE slug = $1 AND id != $2',
      [slug, id]
    );
    if (slugCheck.rows.length > 0) {
      throw new AppError('Content with this title already exists', 409);
    }
  }

  const result = await db.query(
    `UPDATE content 
     SET title = COALESCE($1, title),
         slug = COALESCE($2, slug),
         description = COALESCE($3, description),
         content_text = COALESCE($4, content_text),
         video_url = COALESCE($5, video_url),
         audio_url = COALESCE($6, audio_url),
         thumbnail_url = COALESCE($7, thumbnail_url),
         is_premium = COALESCE($8, is_premium),
         is_published = COALESCE($9, is_published),
         category_id = COALESCE($10, category_id),
         published_at = CASE 
           WHEN $9 = true AND is_published = false THEN CURRENT_TIMESTAMP
           ELSE published_at 
         END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $11
     RETURNING *`,
    [
      title,
      slug,
      description,
      content_text,
      video_url,
      audio_url,
      thumbnail_url,
      is_premium,
      is_published,
      category_id,
      id,
    ]
  );

  res.json({
    message: 'Content updated successfully',
    content: result.rows[0],
  });
};

const getCategories = async (req, res) => {
  const result = await db.query(
    'SELECT * FROM categories ORDER BY name'
  );

  res.json({ categories: result.rows });
};

module.exports = {
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  getCategories,
};