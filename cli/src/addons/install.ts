import path from 'path';
import { FeatureRecord, Manifest } from '../manifest';
import { applyPlans } from './apply';
import { InstallPlan, planInstall } from './plan';
import { AddonManifest } from './types';

export async function installAddons(
  projectDir: string,
  manifest: Manifest,
  addons: AddonManifest[],
  addonsRoot: string,
  answers: Record<string, Record<string, unknown>>,
): Promise<Manifest> {
  const pending = new Map<string, string>();
  const plans: InstallPlan[] = [];
  for (const addon of addons) {
    plans.push(
      await planInstall(
        projectDir,
        manifest.modules,
        addon,
        path.join(addonsRoot, addon.name),
        answers[addon.name] ?? {},
        { projectName: manifest.projectName, pending },
      ),
    );
  }
  await applyPlans(projectDir, plans);

  const installedAt = new Date().toISOString();
  const features: Record<string, FeatureRecord> = { ...manifest.features };
  for (const addon of addons) {
    features[addon.name] = {
      version: addon.version,
      options: answers[addon.name] ?? {},
      installedAt,
    };
  }
  return { ...manifest, features };
}
