// Simple Tauri authentication service
import { invoke } from '@tauri-apps/api/core';

export class SimpleTauriAuthService {
  // Securely store authentication tokens in Tauri's secure storage
  async storeToken(token: string, refreshToken: string, userId: string, username: string, permissions: string[]): Promise<void> {
    await invoke('store_auth_token', {
      token,
      refreshToken,
      userId,
      username,
      permissions
    });
  }

  // Retrieve authentication tokens from Tauri's secure storage
  async getToken(): Promise<[string, string] | null> {
    return await invoke('get_auth_token');
  }

  // Clear stored authentication tokens from Tauri's secure storage
  async clearToken(): Promise<void> {
    await invoke('clear_auth_token');
  }
}

export const simpleTauriAuthService = new SimpleTauriAuthService();