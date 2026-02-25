export interface User {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  is_creator: boolean;
}

export interface Content {
  id: string;
  creator_id: string;
  category_id?: string;
  title: string;
  slug: string;
  description?: string;
  content_type: 'blog' | 'video' | 'podcast';
  content_text?: string;
  video_url?: string;
  audio_url?: string;
  thumbnail_url?: string;
  is_premium: boolean;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  creator_username?: string;
  creator_display_name?: string;
  creator_avatar?: string;
  creator_bio?: string;
  category_name?: string;
  category_slug?: string;
  has_access?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ContentResponse {
  content: Content[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  error: string;
}