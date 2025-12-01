// Authentication-related type definitions

export interface User {
  id: string;
  login: string;
  nom?: string;
  email?: string;
  profil_id?: string;
  profil?: {
    id: string;
    code: string;
    libelle: string;
  };
  permissions?: Permission[];
  stations_user?: any[]; // Define proper type when station structure is defined
}

export interface Permission {
  id: string;
  name: string;
  libelle?: string;
  description?: string;
  resource?: string;
  action?: string;
}

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface RegisterData {
  login: string;
  password: string;
  email: string;
  nom?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  permissions: Permission[];
}