// User state management
import { writable } from 'svelte/store';
import type { User } from '$lib/types/auth';

function createUserStore() {
  const { subscribe, set, update } = writable<User | null>(null);

  return {
    subscribe,
    
    // Set user data
    set: (user: User | null) => {
      set(user);
    },
    
    // Update user data
    update: (updater: (user: User | null) => User | null) => {
      update(updater);
    },
    
    // Reset user data
    reset: () => {
      set(null);
    },
    
    // Update specific user properties
    updateProperties: (properties: Partial<User>) => {
      update(current => {
        if (!current) return null;
        return { ...current, ...properties };
      });
    }
  };
}

export const user = createUserStore();