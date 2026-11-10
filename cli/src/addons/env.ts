import { injectAtMarker, MarkerNotFoundError } from './inject';
import { EnvVar } from './types';

export const ENV_EXAMPLE_FILE = '.env.example';
export const ENV_MARKER = '# cfsa:env';
export const JOI_MARKER = '/* cfsa:env */';

function hasKey(envExample: string, key: string): boolean {
  return envExample.split('\n').some((l) => l.trim().startsWith(`${key}=`));
}

export function appendEnv(
  envExample: string,
  vars: EnvVar[],
  addonName: string,
): string {
  const lines = envExample.split('\n');
  const index = lines.findIndex((l) => l.trim() === ENV_MARKER);
  if (index === -1) throw new MarkerNotFoundError(ENV_EXAMPLE_FILE, ENV_MARKER);
  const missing = vars.filter((v) => !hasKey(envExample, v.key));
  if (missing.length === 0) return envExample;
  const block = [
    `# ${addonName}`,
    ...missing.map((v) => `${v.key}=${v.example}`),
  ];
  lines.splice(index, 0, ...block);
  return lines.join('\n');
}

export function injectJoi(
  validation: string,
  file: string,
  vars: EnvVar[],
): string {
  return vars.reduce(
    (content, v) =>
      content.includes(`${v.key}:`)
        ? content
        : injectAtMarker(content, file, JOI_MARKER, `${v.key}: ${v.joi},`),
    validation,
  );
}
