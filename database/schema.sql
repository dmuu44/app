-- Create database
CREATE DATABASE content_media_app;

-- Connect to database
\c content_media_app;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table for creators and users
CREATE TABLE profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    is_creator BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content table
CREATE TABLE content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('blog', 'video', 'podcast')),
    content_text TEXT,
    video_url TEXT,
    audio_url TEXT,
    thumbnail_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscription plans
CREATE TABLE subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions
CREATE TABLE user_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status VARCHAR(20) DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Authentication table (simple implementation)
CREATE TABLE user_auth (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO categories (name, slug, description) VALUES
('Technology', 'technology', 'Latest tech news and tutorials'),
('Business', 'business', 'Business strategies and insights'),
('Entertainment', 'entertainment', 'Movies, music, and entertainment'),
('Education', 'education', 'Learning resources and courses'),
('Lifestyle', 'lifestyle', 'Health, wellness, and lifestyle tips');

-- Insert sample creator
INSERT INTO profiles (email, username, display_name, bio, is_creator) VALUES
('creator@example.com', 'techguru', 'Tech Guru', 'Technology enthusiast and content creator', true);

-- Insert sample content
INSERT INTO content (creator_id, category_id, title, slug, description, content_type, content_text, is_premium, is_published, published_at) VALUES
(
    (SELECT id FROM profiles WHERE username = 'techguru'),
    (SELECT id FROM categories WHERE slug = 'technology'),
    'Getting Started with React',
    'getting-started-with-react',
    'A comprehensive guide to start with React development',
    'blog',
    'React is a powerful JavaScript library for building user interfaces...',
    false,
    true,
    CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_content_creator_id ON content(creator_id);
CREATE INDEX idx_content_category_id ON content(category_id);
CREATE INDEX idx_content_published ON content(is_published, published_at);
CREATE INDEX idx_content_type ON content(content_type);
CREATE INDEX idx_user_subscriptions_user ON user_subscriptions(user_id, creator_id);