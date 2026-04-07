import path from 'path';

export type TemplateType = 'frontend' | 'backend';

export interface Template {
  name: string;
  displayName: string;
  type: TemplateType;
  path: string;
  description: string;
}

const TEMPLATES_ROOT = path.resolve(__dirname, '../../');

export const templates: Record<string, Template> = {
  nest: {
    name: 'nest',
    displayName: 'NestJS',
    type: 'backend',
    path: path.join(TEMPLATES_ROOT, 'nest-template'),
    description: 'NestJS 11 with PostgreSQL, TypeORM, JWT auth, and transactional email',
  },
  react: {
    name: 'react',
    displayName: 'React (Vite)',
    type: 'frontend',
    path: path.join(TEMPLATES_ROOT, 'react-template'),
    description: 'React 19 with Vite 7, Tailwind CSS v4, Redux Toolkit, React Router v7',
  },
  next: {
    name: 'next',
    displayName: 'Next.js',
    type: 'frontend',
    path: path.join(TEMPLATES_ROOT, 'next-template'),
    description: 'Next.js 16 App Router with Tailwind CSS v4, Redux Toolkit, next-themes',
  },
};

export function getFrontendTemplates(): Template[] {
  return Object.values(templates).filter((t) => t.type === 'frontend');
}

export function getBackendTemplates(): Template[] {
  return Object.values(templates).filter((t) => t.type === 'backend');
}
