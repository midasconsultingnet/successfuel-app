// Plugin API service
import BaseAPI from './base';

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  permissions: string[];
  dependencies: string[];
}

export class PluginAPI {
  static async getPlugins(): Promise<Plugin[]> {
    return BaseAPI.get('/plugins');
  }
  
  static async getPlugin(pluginId: string): Promise<Plugin> {
    return BaseAPI.get(`/plugins/${pluginId}`);
  }
  
  static async enablePlugin(pluginId: string): Promise<void> {
    return BaseAPI.post(`/plugins/${pluginId}/enable`);
  }
  
  static async disablePlugin(pluginId: string): Promise<void> {
    return BaseAPI.post(`/plugins/${pluginId}/disable`);
  }
  
  static async installPlugin(pluginPath: string): Promise<Plugin> {
    return BaseAPI.post('/plugins/install', { path: pluginPath });
  }
  
  static async updatePlugin(pluginId: string): Promise<Plugin> {
    return BaseAPI.put(`/plugins/${pluginId}/update`);
  }
  
  static async deletePlugin(pluginId: string): Promise<void> {
    return BaseAPI.delete(`/plugins/${pluginId}`);
  }
}

export default PluginAPI;