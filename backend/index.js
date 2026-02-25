const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get all published content
app.get('/api/content', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*, profiles(*), categories(*)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get content by ID
app.get('/api/content/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*, profiles(*), categories(*)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new content (protected)
app.post('/api/content', async (req, res) => {
  try {
    const { title, description, contentType, contentText, videoUrl, audioUrl, thumbnailUrl, isPremium, categoryId } = req.body;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(req.headers.authorization?.replace('Bearer ', ''));
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('content')
      .insert([
        {
          creator_id: user.id,
          title,
          description,
          content_type: contentType,
          content_text: contentText,
          video_url: videoUrl,
          audio_url: audioUrl,
          thumbnail_url: thumbnailUrl,
          is_premium: isPremium || false,
          category_id: categoryId,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          is_published: true
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});