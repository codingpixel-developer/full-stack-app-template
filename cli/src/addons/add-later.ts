import { Manifest } from '../manifest';
import { AddonManifest } from './types';

export const ADD_LATER_MIN_CLI = '0.4.0';

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function canAddLater(
  manifest: Manifest,
  addon: AddonManifest,
): { ok: true } | { ok: false; reason: string } {
  const createdWith = manifest.createdWithCli ?? manifest.cliVersion;
  if (compareVersions(createdWith, ADD_LATER_MIN_CLI) < 0) {
    return {
      ok: false,
      reason: `This project was made with CLI ${createdWith}; adding features later needs ${ADD_LATER_MIN_CLI} or newer. Re-create the project or add this manually.`,
    };
  }
  if (!addon.addLater) {
    return {
      ok: false,
      reason: `"${addon.name}" can only be chosen when the project is created.`,
    };
  }
  return { ok: true };
}
