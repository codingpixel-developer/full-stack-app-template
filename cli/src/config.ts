export const PARENT_REPO = 'codingpixel-developer/full-stack-app-template';
export const DEFAULT_REF = process.env.CFSA_REF || 'main';

export function parentSpec(subpath: string, ref: string = DEFAULT_REF): string {
  return `${PARENT_REPO}/${subpath}#${ref}`;
}

export function templateSpec(repo: string, ref: string = DEFAULT_REF): string {
  return `${repo}#${ref}`;
}
