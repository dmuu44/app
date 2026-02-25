import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Headphones, FileText, Lock, Calendar, User, Star, Eye } from 'lucide-react';
import { Content } from '../../types';

interface ContentCardProps {
  content: Content;
}

export const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  const getContentIcon = () => {
    switch (content.content_type) {
      case 'video':
        return <Play className="h-5 w-5" />;
      case 'podcast':
        return <Headphones className="h-5 w-5" />;
      case 'blog':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = () => {
    switch (content.content_type) {
      case 'video':
        return 'from-red-500 to-pink-500';
      case 'podcast':
        return 'from-purple-500 to-indigo-500';
      case 'blog':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeGradient = () => {
    switch (content.content_type) {
      case 'video':
        return 'bg-gradient-to-br from-red-500 to-pink-500';
      case 'podcast':
        return 'bg-gradient-to-br from-purple-500 to-indigo-500';
      case 'blog':
        return 'bg-gradient-to-br from-blue-500 to-cyan-500';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReadTime = () => {
    if (content.content_type === 'blog' && content.content_text) {
      const words = content.content_text.split(' ').length;
      const minutes = Math.ceil(words / 200);
      return `${minutes} min read`;
    }
    return null;
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-500 hover:scale-105 animate-fade-in shine-effect">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {content.thumbnail_url ? (
          <img
            src={content.thumbnail_url}
            alt={content.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${getTypeGradient()} bg-gradient-to-br`}>
            <div className="text-white text-4xl opacity-80">
              {getContentIcon()}
            </div>
          </div>
        )}
        
        {/* Premium Badge */}
        {content.is_premium && (
          <div className="absolute top-3 left-3">
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
              <Star className="h-3 w-3" fill="currentColor" />
              <span>PREMIUM</span>
            </div>
          </div>
        )}

        {/* Content Type Badge */}
        <div className="absolute top-3 right-3">
          <div className={`bg-gradient-to-r ${getTypeColor()} text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center space-x-1`}>
            {getContentIcon()}
            <span className="capitalize">{content.content_type}</span>
          </div>
        </div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* View Button */}
        <div className="absolute bottom-3 left-3 right-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <Link
            to={`/content/${content.id}`}
            className="w-full bg-white text-gray-900 px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors shadow-lg"
          >
            <Eye className="h-4 w-4" />
            <span>View {content.content_type}</span>
          </Link>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        {/* Category */}
        {content.category_name && (
          <span className="inline-block bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-medium mb-3">
            {content.category_name}
          </span>
        )}

        {/* Title */}
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-tight text-lg group-hover:text-purple-600 transition-colors">
          <Link to={`/content/${content.id}`}>
            {content.title}
          </Link>
        </h3>

        {/* Description */}
        {content.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
            {content.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            {/* Creator */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium text-gray-700">
                {content.creator_display_name || content.creator_username}
              </span>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center space-x-1 text-gray-400">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(content.created_at)}</span>
          </div>
        </div>

        {/* Read Time & Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {getReadTime() && (
            <span className="text-xs text-gray-400 font-medium">
              {getReadTime()}
            </span>
          )}
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span>👁️ 1.2K views</span>
            <span>❤️ 45 likes</span>
          </div>
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-purple-500/20 transition-colors duration-300 pointer-events-none"></div>
    </div>
  );
};