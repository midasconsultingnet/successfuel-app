// Plugin-related type definitions

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  entry: string;
  routes?: PluginRoute[];
  permissions?: string[];
  dependencies?: string[];
  hooks?: PluginHooks;
  metadata?: Record<string, any>;
}

export interface PluginRoute {
  path: string;
  component: string;
  permissions?: string[];
  metadata?: Record<string, any>;
}

export interface PluginHooks {
  onLoad?: string;
  onUnload?: string;
  onActivate?: string;
  onDeactivate?: string;
}

export interface PluginState {
  manifest: PluginManifest;
  enabled: boolean;
  loaded: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface PluginRegistry {
  [id: string]: PluginState;
}

export interface PluginModule {
  default: any; // The Svelte component
  manifest: PluginManifest;
  init?: (context: PluginContext) => Promise<void> | void;
  destroy?: () => Promise<void> | void;
}

export interface PluginContext {
  api: any; // Plugin API
  store: any; // Access to app stores
  utils: any; // Utility functions
}

export interface PluginLoadOptions {
  forceReload?: boolean;
  skipValidation?: boolean;
  context?: PluginContext;
}