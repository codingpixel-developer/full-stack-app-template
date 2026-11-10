export interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

function addMissing(
  current: Record<string, string> | undefined,
  wanted: Record<string, string>,
): Record<string, string> | undefined {
  if (!current && Object.keys(wanted).length === 0) return current;
  const merged = { ...(current ?? {}) };
  for (const [name, version] of Object.entries(wanted)) {
    if (!(name in merged)) merged[name] = version;
  }
  return merged;
}

export function mergeDeps(
  pkg: PackageJson,
  deps: Record<string, string>,
  dev: Record<string, string>,
): PackageJson {
  return {
    ...pkg,
    dependencies: addMissing(pkg.dependencies, deps),
    devDependencies: addMissing(pkg.devDependencies, dev),
  };
}
