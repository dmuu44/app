const db = require('../config/database');
const { hashPassword, verifyPassword, generateToken, validateEmail, AppError } = require('../utils/helpers');

const register = async (req, res) => {
  const { email, password, username, display_name, bio, website } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  if (!validateEmail(email)) {
    throw new AppError('Invalid email format', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  // Check if user already exists
  const existingUser = await db.query(
    'SELECT id FROM profiles WHERE email = $1 OR username = $2',
    [email, username]
  );

  if (existingUser.rows.length > 0) {
    throw new AppError('User with this email or username already exists', 409);
  }

  const hashedPassword = await hashPassword(password);

  // Start transaction
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Create profile
    const profileResult = await client.query(
      `INSERT INTO profiles (email, username, display_name, bio, website) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, username, display_name, avatar_url, bio, website, is_creator`,
      [email, username, display_name, bio, website]
    );

    const user = profileResult.rows[0];

    // Create auth record
    await client.query(
      'INSERT INTO user_auth (user_id, password_hash) VALUES ($1, $2)',
      [user.id, hashedPassword]
    );

    // Generate token
    const token = generateToken(user.id);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Get user with auth data
  const userResult = await db.query(
    `SELECT p.id, p.email, p.username, p.display_name, p.avatar_url, p.bio, p.website, p.is_creator, a.password_hash
     FROM profiles p
     JOIN user_auth a ON p.id = a.user_id
     WHERE p.email = $1`,
    [email]
  );

  if (userResult.rows.length === 0) {
    throw new AppError('Invalid email or password', 401);
  }

  const user = userResult.rows[0];
  const isValidPassword = await verifyPassword(password, user.password_hash);

  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  // Remove password hash from response
  delete user.password_hash;

  const token = generateToken(user.id);

  res.json({
    message: 'Login successful',
    user,
    token,
  });
};

const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

const updateProfile = async (req, res) => {
  const { username, display_name, bio, website, avatar_url } = req.body;
  const userId = req.user.id;

  const result = await db.query(
    `UPDATE profiles 
     SET username = COALESCE($1, username),
         display_name = COALESCE($2, display_name),
         bio = COALESCE($3, bio),
         website = COALESCE($4, website),
         avatar_url = COALESCE($5, avatar_url),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING id, email, username, display_name, avatar_url, bio, website, is_creator`,
    [username, display_name, bio, website, avatar_url, userId]
  );

  res.json({
    message: 'Profile updated successfully',
    user: result.rows[0],
  });
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};