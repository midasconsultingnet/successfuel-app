import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { AuthState, User, Permission } from '$lib/types/auth';
import { getAuthService } from '$lib/services/auth'; // Updated import

// Initialize from localStorage if in browser
function getStoredToken(): string | null {
  if (!browser) return null;
  try {
    return localStorage.getItem('authToken');
  } catch {
    return null;
  }
}

function getStoredUser(): User | null {
  if (!browser) return null;
  try {
    const userStr = localStorage.getItem('authUser');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

// Initial state
const initialState: AuthState = {
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: false,
  loading: false,
  error: null,
  permissions: []
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,

    // Login user
    login(authData: Partial<AuthState>): void {
      const newAuthState: AuthState = {
        ...get(this),
        ...authData,
        isAuthenticated: true,
        loading: false,
        error: null
      };

      // Store token and user in localStorage if in browser
      if (browser) {
        if (authData.token) {
          localStorage.setItem('authToken', authData.token);
        }
        if (authData.user) {
          localStorage.setItem('authUser', JSON.stringify(authData.user));
        }
      }

      set(newAuthState);
    },

    // Logout user
    logout(): void {
      // Clear stored data if in browser
      if (browser) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        permissions: []
      });
    },

    // Update user
    updateUser(user: User): void {
      update(state => {
        const newState = { ...state, user };

        // Update stored user if in browser
        if (browser) {
          localStorage.setItem('authUser', JSON.stringify(user));
        }

        return newState;
      });
    },

    // Update token
    updateToken(token: string): void {
      update(state => {
        const newState = { ...state, token };

        // Update stored token if in browser
        if (browser) {
          localStorage.setItem('authToken', token);
        }

        return newState;
      });
    },

    // Update permissions
    updatePermissions(permissions: Permission[]): void {
      update(state => ({ ...state, permissions }));
    },

    // Set loading state
    setLoading(loading: boolean): void {
      update(state => ({ ...state, loading }));
    },

    // Set error
    setError(error: string | null): void {
      update(state => ({ ...state, error }));
    },

    // Initialize from saved token
    initFromSavedToken(): void {
      const token = getStoredToken();
      const user = getStoredUser();

      if (token && user) {
        set({
          ...initialState,
          token,
          user,
          isAuthenticated: true
        });
      } else {
        set(initialState);
      }
    },

    // Refresh auth state
    async refresh(): Promise<void> {
      if (!get(this).token) return;

      try {
        const authService = await getAuthService();
        await authService.getProfile(true); // Force refresh to get latest data
      } catch (error) {
        // If refresh fails, logout
        this.logout();
      }
    }
  };
}

export const auth = createAuthStore();

// Export the store value as a readable reference
export const authStore = {
  get isAuthenticated() {
    return get(auth).isAuthenticated;
  },
  get user() {
    return get(auth).user;
  },
  get token() {
    return get(auth).token;
  },
  get permissions() {
    return get(auth).permissions;
  }
};