import axios from 'axios';
import { AuthResponse, ContentResponse, Content, Category, User } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    username?: string;
    display_name?: string;
    bio?: string;
    website?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<{ user: User; message: string }> => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
};

export const contentAPI = {
  getAllContent: async (params?: {
    type?: string;
    category?: string;
    page?: number;
    limit?: number;
    premium?: boolean;
  }): Promise<ContentResponse> => {
    const response = await api.get('/content', { params });
    return response.data;
  },

  getContentById: async (id: string): Promise<{ content: Content }> => {
    const response = await api.get(`/content/${id}`);
    return response.data;
  },

  createContent: async (contentData: Partial<Content>): Promise<{ content: Content; message: string }> => {
    const response = await api.post('/content', contentData);
    return response.data;
  },

  updateContent: async (id: string, contentData: Partial<Content>): Promise<{ content: Content; message: string }> => {
    const response = await api.put(`/content/${id}`, contentData);
    return response.data;
  },

  getCategories: async (): Promise<{ categories: Category[] }> => {
    const response = await api.get('/content/categories');
    return response.data;
  },
};

export default api;