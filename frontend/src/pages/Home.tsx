import React, { useState, useEffect } from 'react';
import { ContentGrid } from '../components/Content/ContentGrid';
import { Content, Category } from '../types';
import { contentAPI } from '../services/api';

export const Home: React.FC = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    page: 1,
  });

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contentAPI.getAllContent(filters);
      setContent(response.content);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await contentAPI.getCategories();
      setCategories(response.categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    loadContent();
    loadCategories();
  }, [filters]);

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const contentTypes = [
    { value: '', label: 'All Types' },
    { value: 'blog', label: 'Blogs' },
    { value: 'video', label: 'Videos' },
    { value: 'podcast', label: 'Podcasts' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Content
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore blogs, videos, and podcasts from talented creators. 
            Access exclusive premium content and expand your knowledge.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Content Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => updateFilter('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {contentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ type: '', category: '', page: 1 })}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Content Grid */}
        <ContentGrid content={content} loading={loading} />

        {/* Load More Button */}
        {content.length > 0 && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              className="px-6 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Load More Content
            </button>
          </div>
        )}
      </div>
    </div>
  );
};