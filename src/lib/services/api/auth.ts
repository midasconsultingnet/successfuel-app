// Authentication API service
import BaseAPI from './base';

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
}

export interface LoginResponseData {
  token: string;
  user: {
    id: string;
    login: string;
    profil_id: string;
    stations_user: any[];
  };
}

export interface LoginResponse {
  success: boolean;
  data: LoginResponseData;
  refresh_token: string;
}

export interface ProfileUser {
  id: string;
  login: string;
  nom: string;
  email: string;
  profil: {
    id: string;
    code: string;
    libelle: string;
  };
  permissions: Array<{
    id: string;
    libelle: string;
  }>;
}

export interface ProfileResponse {
  user: ProfileUser;
}

export interface RefreshTokenResponseData {
  token: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: RefreshTokenResponseData;
}

export interface RegisterData {
  login: string;
  password: string;
  name: string;
}

export interface RegisterResponseData {
  user: {
    id: string;
    login: string;
    profil_id: string;
    stations_user: any[];
  };
  token: string;
}

export interface RegisterResponse {
  success: boolean;
  data: RegisterResponseData;
  refresh_token: string;
}

export class AuthAPI {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return BaseAPI.post('/auth/login', credentials);
  }

  static async register(userData: RegisterData): Promise<RegisterResponse> {
    return BaseAPI.post('/auth/register', userData);
  }

  static async getProfile(): Promise<ApiResponse<ProfileResponse>> {
    return BaseAPI.get('/auth/profile');
  }

  static async logout(): Promise<ApiResponse<any>> {
    return BaseAPI.post('/auth/logout');
  }

  static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return BaseAPI.post('/auth/refresh', { refreshToken });
  }
}

export default AuthAPI;