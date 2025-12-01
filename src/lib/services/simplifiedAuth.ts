// Simple authentication service
import { AuthAPI, type LoginCredentials } from '$lib/services/api/auth';
import { auth } from '$lib/stores/auth';
import { invoke } from '@tauri-apps/api/core';
import { get } from 'svelte/store';
import type { Permission } from '$lib/types/auth';

interface ProfileCache {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export class SimpleAuthService {
  private profileCache: ProfileCache | null = null;
  private profileRequestPromise: Promise<void> | null = null;

  // Login user - securely stores credentials in Tauri
  async login(credentials: LoginCredentials): Promise<void> {
    try {
      console.log('Starting login process...');
      // Call the API to authenticate
      const response = await AuthAPI.login(credentials);

      if (!response.success) {
        throw new Error('Login failed: Invalid credentials');
      }

      console.log('Login API call successful, storing token in Tauri...');
      // Securely store the token in Tauri
      await invoke('store_auth_token', {
        token: response.data.token,
        refreshToken: response.refresh_token,
        userId: response.data.user.id,
        username: response.data.user.login,
        permissions: [] // Will be populated after getting profile
      });

      console.log('Token stored in Tauri, updating auth store...');
      // Update auth store
      auth.login({
        token: response.data.token,
        user: {
          id: response.data.user.id,
          login: response.data.user.login,
          nom: response.data.user.login,
          email: response.data.user.login,
          profil: {
            id: response.data.user.profil_id,
            code: '',
            libelle: ''
          },
          permissions: []
        },
        permissions: [],
        isAuthenticated: true,
        loading: false,
        error: null
      });

      console.log('Auth store updated, loading profile...');
      // Load user profile after successful login to update permissions
      await this.getProfile();
      console.log('Login process completed successfully.');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      auth.setError(errorMessage);
      throw error;
    }
  }

  // Logout user - clears secure storage
  async logout(): Promise<void> {
    try {
      console.log('Starting logout process...');
      // Clear secure storage in Tauri
      await invoke('clear_auth_token');

      // Clear local authentication state
      auth.logout();

      // Clear profile cache
      this.clearProfileCache();

      console.log('Logout process completed successfully.');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Initialize auth - retrieve token from secure Tauri storage and load user profile
  async initialize(): Promise<void> {
    try {
      console.log('Initializing auth...');
      // Retrieve token from secure Tauri storage
      const tokenResult = await invoke('get_auth_token');

      if (tokenResult) {
        const [token, _] = tokenResult;
        console.log('Token retrieved from Tauri, initializing auth store...');

        // Initialize auth store with the token
        auth.login({
          token,
          isAuthenticated: true,
          loading: false,
          error: null
        });

        console.log('Auth store initialized, loading profile...');
        // Load user profile to complete the initialization
        await this.getProfile();
        console.log('Auth initialization completed.');
      } else {
        console.log('No token found in Tauri storage.');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear auth state if initialization fails
      auth.logout();
    }
  }

  // Simple token refresh - returns true since we don't implement refresh in this version
  async refreshTokenIfNeeded(): Promise<boolean> {
    // In our simplified version, we don't implement automatic token refresh
    // Just return true to indicate the token is valid
    return true;
  }

  // Get user profile with caching
  async getProfile(forceRefresh: boolean = false): Promise<void> {
    // If we have a pending request, return that promise to avoid duplicate requests
    if (this.profileRequestPromise && !forceRefresh) {
      console.log('Profile request already in progress, waiting...');
      return this.profileRequestPromise;
    }

    // If we have cached data and it's still valid (and no force refresh), return cached data
    if (this.profileCache && !forceRefresh) {
      const now = Date.now();
      if (now - this.profileCache.timestamp < this.profileCache.ttl) {
        console.log('Using cached profile data');
        // Update auth store with cached data
        const cachedData = this.profileCache.data;  // This is response.data
        const userProfile = {
          id: cachedData.user.id,
          login: cachedData.user.login,
          nom: cachedData.user.nom || cachedData.user.login,
          email: cachedData.user.email,
          profil: cachedData.user.profil,
          permissions: cachedData.user.permissions.map((perm: any) => ({
            id: perm.id || '',
            libelle: perm.libelle,
            name: perm.libelle,
            description: perm.libelle
          }))
        };

        auth.updateUser(userProfile);
        auth.updatePermissions(userProfile.permissions);
        return;
      } else {
        console.log('Cached profile data is expired');
      }
    }

    // Make the API call
    this.profileRequestPromise = this.fetchProfileFromAPI()
      .then(() => {
        this.profileRequestPromise = null;
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
        this.profileRequestPromise = null;
        throw error;
      });

    return this.profileRequestPromise;
  }

  private async fetchProfileFromAPI(): Promise<void> {
    console.log('Fetching user profile from API...');
    try {
      const response = await AuthAPI.getProfile();

      if (!response.success) {
        throw new Error('Failed to fetch user profile');
      }

      console.log('Profile API call successful, processing response...');
      // Convert permissions from API to full format
      const fullPermissions = response.data.user.permissions.map(perm => ({
        id: perm.id || '',
        libelle: perm.libelle,
        name: perm.libelle,
        description: perm.libelle
      }));

      // Map the API response to the expected format
      const userProfile = {
        id: response.data.user.id,
        login: response.data.user.login,
        nom: response.data.user.nom || response.data.user.login,
        email: response.data.user.email,
        profil: response.data.user.profil,
        permissions: fullPermissions
      };

      // Update user in auth store (only if we have valid data)
      if (userProfile.id) {
        auth.updateUser(userProfile);
        auth.updatePermissions(fullPermissions);

        console.log('Updating permissions in Tauri storage...');
        // Update permissions in Tauri storage as well
        await this.syncPermissionsToTauri(fullPermissions);
        
        // Cache the profile data
        this.profileCache = {
          data: response.data,  // Only cache the actual data, not the entire response
          timestamp: Date.now(),
          ttl: 5 * 60 * 1000 // 5 minutes
        };
        
        console.log('Profile loaded and cached successfully.');
      } else {
        console.error('Received invalid user profile data');
        throw new Error('Invalid user profile data received');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
      console.error('Error fetching profile:', error);
      auth.setError(errorMessage);
      throw error;
    }
  }

  // Clear the profile cache
  clearProfileCache(): void {
    this.profileCache = null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return get(auth).isAuthenticated;
  }

  // Check if user has a specific permission
  hasPermission(permission: string): boolean {
    return get(auth).permissions.some(perm => perm.libelle === permission);
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  // Check if user has all of the specified permissions
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  // Get current user
  getCurrentUser() {
    return get(auth).user;
  }

  // Synchronize permissions with Tauri storage
  private async syncPermissionsToTauri(permissions: Permission[]): Promise<void> {
    const currentTokenResult = await invoke('get_auth_token');
    if (currentTokenResult) {
      const [token, refreshToken] = currentTokenResult;

      // Get other user data
      const authState = get(auth);
      const user = authState.user;

      if (user) {
        await invoke('store_auth_token', {
          token,
          refreshToken,
          userId: user.id,
          username: user.login,
          permissions: permissions.map(p => p.libelle)
        });
      }
    }
  }
}

export const simpleAuthService = new SimpleAuthService();