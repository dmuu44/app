import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Content } from '../types';
import { contentAPI } from '../services/api';

export const ContentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await contentAPI.getContentById(id);
        setContent(res.content);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (!id) {
    return <Navigate to="/" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {content.title}
        </h1>

        {content.category_name && (
          <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-medium mb-2">
            {content.category_name}
          </span>
        )}

        <p className="text-gray-700 mb-6">
          {content.description}
        </p>

        {/* Content body */}
        {content.content_type === 'blog' && content.content_text && (
          <div className="prose prose-lg text-gray-800">
            {content.content_text}
          </div>
        )}

        {content.content_type === 'video' && content.video_url && (
          <div className="mb-6">
            <video controls className="w-full">
              <source src={content.video_url} />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {content.content_type === 'podcast' && content.audio_url && (
          <div className="mb-6">
            <audio controls className="w-full">
              <source src={content.audio_url} />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
};
