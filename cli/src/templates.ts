export type TemplateType = 'frontend' | 'backend';

export interface Template {
  name: string;
  displayName: string;
  type: TemplateType;
  repo?: string;
  repoRef?: string;
  description: string;
  comingSoon?: boolean;
}

export const templates: Record<string, Template> = {
  nest: {
    name: 'nest',
    displayName: 'NestJS',
    type: 'backend',
    repo: 'codingpixel-developer/nestjs-tempate',
    description: 'NestJS 11 with PostgreSQL, TypeORM, JWT auth, and transactional email',
  },
  react: {
    name: 'react',
    displayName: 'React (Vite)',
    type: 'frontend',
    repo: 'codingpixel-developer/react-template',
    description: 'React 19 with Vite 7, Tailwind CSS v4, Redux Toolkit, React Router v7',
  },
  next: {
    name: 'next',
    displayName: 'Next.js',
    type: 'frontend',
    repo: 'codingpixel-developer/next-js-template',
    description: 'Next.js 16 App Router with Tailwind CSS v4, Redux Toolkit, next-themes',
  },
  supabase: {
    name: 'supabase',
    displayName: 'Supabase',
    type: 'backend',
    description: 'Hosted Postgres + auth + storage',
    comingSoon: true,
  },
  firebase: {
    name: 'firebase',
    displayName: 'Firebase',
    type: 'backend',
    description: 'Firestore + auth + cloud functions',
    comingSoon: true,
  },
};

export function getFrontendTemplates(): Template[] {
  return Object.values(templates).filter((t) => t.type === 'frontend');
}

export function getBackendTemplates(): Template[] {
  return Object.values(templates).filter((t) => t.type === 'backend');
}
