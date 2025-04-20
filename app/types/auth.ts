export interface LoginResponse {
  message: string;
  token: string;
  success: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UseAuthReturn {
  login: (credentials: LoginCredentials) => Promise<{ error: string; requiresEmailActivation: boolean; } | boolean | null>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

export interface AuthError {
  message: string;
}

export interface ApiError {
  message: string;
  // Other properties like path, type, context
}