import tiged from 'tiged';

export async function fetchRepo(spec: string, dest: string): Promise<void> {
  const emitter = tiged(spec, {
    cache: false,
    force: true,
    verbose: false,
  });
  await emitter.clone(dest);
}
