import React from 'react';
import { ContentCard } from './ContentCard';
import { Content } from '../../types';
import { Sparkles, Frown } from 'lucide-react';

interface ContentGridProps {
  content: Content[];
  loading?: boolean;
}

export const ContentGrid: React.FC<ContentGridProps> = ({ content, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <Frown className="h-12 w-12 text-purple-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No content found</h3>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          We couldn't find any content matching your filters. Try adjusting your search or explore different categories.
        </p>
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-200 hover:scale-105">
          Explore All Content
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {content.map((item, index) => (
        <ContentCard 
          key={item.id} 
          content={item}
        />
      ))}
    </div>
  );
};