import { ModuleKey } from '../manifest';

export type ModulePart = 'backend' | 'webApp' | 'admin';

export const MODULE_PARTS: ModulePart[] = ['backend', 'webApp', 'admin'];

export interface AddonOption {
  key: string;
  type: 'confirm' | 'list' | 'input';
  message: string;
  choices?: string[];
  default?: string | boolean;
  comingSoon?: string[];
}

export interface InjectRule {
  module: ModulePart;
  file: string;
  marker: string;
  line: string;
}

export interface EnvVar {
  module: ModulePart;
  key: string;
  example: string;
  joi: string;
}

export interface AddonManifest {
  name: string;
  displayName: string;
  description: string;
  version: string;
  requires: string[];
  conflicts: string[];
  requiresModules: ModuleKey[];
  addLater: boolean;
  options: AddonOption[];
  dependencies: Partial<Record<ModulePart, Record<string, string>>>;
  devDependencies: Partial<Record<ModulePart, Record<string, string>>>;
  env: EnvVar[];
  inject: InjectRule[];
}
