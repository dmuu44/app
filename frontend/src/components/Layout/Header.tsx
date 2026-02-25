import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, LogOut, Menu, X, Sparkles, Video, Podcast, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navigation = [
    { name: 'Blogs', href: '/?type=blog', icon: FileText, color: 'text-blue-500' },
    { name: 'Videos', href: '/?type=video', icon: Video, color: 'text-red-500' },
    { name: 'Podcasts', href: '/?type=podcast', icon: Podcast, color: 'text-purple-500' },
  ];

  const isActiveLink = (href: string) => {
    return location.search === href.split('?')[1];
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group animate-slide-in"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-110">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ContentHub
              </span>
              <span className="text-xs text-gray-500 -mt-1">Creator Platform</span>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActiveLink(item.href)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActiveLink(item.href) ? 'text-white' : item.color}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Discover amazing content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 focus:bg-white focus:shadow-lg"
              />
            </form>
          </div>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  to="/create"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-200 hover:scale-105"
                >
                  Create +
                </Link>
                <div className="flex items-center space-x-3 bg-gray-50 rounded-xl px-3 py-2">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.display_name || user.email}
                      className="w-8 h-8 rounded-full ring-2 ring-purple-500/20"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center ring-2 ring-purple-500/20">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 max-w-32 truncate">
                    {user.display_name || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/login"
                  className="px-6 py-2.5 text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-200 hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/50 animate-fade-in">
            {/* Search Bar - Mobile */}
            <div className="mb-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </form>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="space-y-2 mb-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActiveLink(item.href)
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-purple-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActiveLink(item.href) ? 'text-white' : item.color}`} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User Menu */}
            {user ? (
              <div className="space-y-3 pt-4 border-t border-gray-200/50">
                <Link
                  to="/create"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                >
                  Create Content
                </Link>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.display_name || user.email}
                        className="w-8 h-8 rounded-full ring-2 ring-purple-500/20"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center ring-2 ring-purple-500/20">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {user.display_name || user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-3 pt-4 border-t border-gray-200/50">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 text-center px-4 py-3 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};