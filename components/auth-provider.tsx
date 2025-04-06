"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id?: string;
  name?: string;
  email: string;
  role: 'recruiter' | 'applicant';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, role: 'recruiter' | 'applicant') => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// API URL for auth endpoints
const API_URL = 'https://jobserver1.onrender.com/api';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch user data with JWT token
  const fetchUser = async (token: string) => {
    try {
      console.log('Fetching user with token:', token);
      const response = await axios.get(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser(response.data);
      console.log('User data fetched successfully:', response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token, user } = response.data;
      
      // Store the raw token without any modifications
      localStorage.setItem('token', token);
      console.log('Token saved to localStorage:', token);
      
      setUser(user);
      
      // Verify token works by fetching user data
      try {
        await axios.get(`${API_URL}/user`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Token verified with user endpoint');
      } catch (err) {
        console.error('Token verification failed:', err);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const signup = async (email: string, password: string, role: 'recruiter' | 'applicant') => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/register`, { email, password, role });
      const { token, user } = response.data;
      
      // Store the raw token without any modifications
      localStorage.setItem('token', token);
      console.log('Token saved to localStorage during signup:', token);
      
      setUser(user);
      
      // Verify token works by fetching user data
      try {
        await axios.get(`${API_URL}/user`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Token verified with user endpoint after signup');
      } catch (err) {
        console.error('Token verification failed after signup:', err);
      }
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
