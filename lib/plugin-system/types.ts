export interface PluginManifest {
  name: string;
  slug: string;
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
  repository?: string;
  license?: string;
  requires?: {
    core?: string;
    plugins?: Record<string, string>;
  };
  entryPoint: string;
}

export interface BlockDefinition {
  type: string;
  label: string;
  icon?: string;
  category?: string;
  defaultContent: any;
  schema?: any;
  render?: (content: any) => any;
  edit?: (content: any, onChange: (content: any) => void) => any;
}

export interface HookCallback {
  (...args: any[]): any;
}

export interface FilterCallback {
  (value: any, ...args: any[]): any;
}

export interface PluginAPI {
  registerBlock: (definition: BlockDefinition) => void;
  addAction: (hookName: string, callback: HookCallback, priority?: number) => void;
  addFilter: (filterName: string, callback: FilterCallback, priority?: number) => void;
  removeAction: (hookName: string, callback: HookCallback) => void;
  removeFilter: (filterName: string, callback: FilterCallback) => void;
  getOption: (key: string, defaultValue?: any) => Promise<any>;
  setOption: (key: string, value: any) => Promise<void>;
  http: {
    get: (url: string, options?: RequestInit) => Promise<Response>;
    post: (url: string, body?: any, options?: RequestInit) => Promise<Response>;
    put: (url: string, body?: any, options?: RequestInit) => Promise<Response>;
    delete: (url: string, options?: RequestInit) => Promise<Response>;
  };
}

export interface Plugin {
  manifest: PluginManifest;
  activate?: (api: PluginAPI) => void | Promise<void>;
  deactivate?: (api: PluginAPI) => void | Promise<void>;
  install?: (api: PluginAPI) => void | Promise<void>;
  uninstall?: (api: PluginAPI) => void | Promise<void>;
}

export interface PluginInstance {
  id: string;
  plugin: Plugin;
  active: boolean;
  config?: Record<string, any>;
}
