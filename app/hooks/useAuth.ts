import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/axios';
import type { LoginCredentials, LoginResponse, UseAuthReturn } from '../types/auth';

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post<LoginResponse>('/users/login', credentials);
      console.log({response});
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        router.push('/dashboard');
        return true;
      }
      return false;
    } catch (err: any) {
      console.log({err});
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      if (err.response?.status === 400 && errorMessage === 'Email Created but Ative Your Email From Message Gmail First') {
        return { error: errorMessage, requiresEmailActivation: true };
      }
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logoutFn = useCallback(() => {
    localStorage.removeItem('token');
    router.push('/');
  }, [router]);

  return {
    login: login,
    logout: logoutFn,
    isLoading: isLoading,
    error: error
  };
};