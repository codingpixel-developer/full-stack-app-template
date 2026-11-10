import { describe, expect, it } from 'vitest';
import { injectAtMarker, MarkerNotFoundError } from '../src/addons/inject';
import { appendEnv, injectJoi } from '../src/addons/env';
import { mergeDeps } from '../src/addons/packages';
import { EnvVar } from '../src/addons/types';

const moduleFile = [
  "import { A } from './a';",
  '// cfsa:imports',
  '@Module({',
  '  imports: [',
  '    A,',
  '    // cfsa:modules',
  '  ],',
  '})',
].join('\n');

const vars: EnvVar[] = [
  { module: 'backend', key: 'FOO_KEY', example: 'abc', joi: 'Joi.string()' },
];

describe('injectAtMarker', () => {
  it('inserts above the marker with the marker indentation', () => {
    const out = injectAtMarker(
      moduleFile,
      'app.module.ts',
      '// cfsa:modules',
      'B,',
    );
    expect(out).toContain('    A,\n    B,\n    // cfsa:modules');
  });

  it('does not insert the same line twice', () => {
    const once = injectAtMarker(
      moduleFile,
      'f',
      '// cfsa:imports',
      "import { B } from './b';",
    );
    const twice = injectAtMarker(
      once,
      'f',
      '// cfsa:imports',
      "import { B } from './b';",
    );
    expect(twice).toBe(once);
  });

  it('throws MarkerNotFoundError carrying file and marker', () => {
    try {
      injectAtMarker(
        'no markers here',
        'src/app.module.ts',
        '// cfsa:providers',
        'X',
      );
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(MarkerNotFoundError);
      expect((e as MarkerNotFoundError).file).toBe('src/app.module.ts');
      expect((e as MarkerNotFoundError).marker).toBe('// cfsa:providers');
    }
  });
});

describe('appendEnv', () => {
  const env = 'APP_NAME=x\n\n# cfsa:env\n';

  it('adds a labelled block above the marker', () => {
    expect(appendEnv(env, vars, 'sample-a')).toBe(
      'APP_NAME=x\n\n# sample-a\nFOO_KEY=abc\n# cfsa:env\n',
    );
  });

  it('skips keys already present', () => {
    const once = appendEnv(env, vars, 'sample-a');
    expect(appendEnv(once, vars, 'sample-a')).toBe(once);
  });
});

describe('injectJoi', () => {
  it('adds KEY: joi above the env marker', () => {
    const src = 'Joi.object({\n  A: Joi.string(),\n  /* cfsa:env */\n});';
    expect(injectJoi(src, 'env.validation.ts', vars)).toContain(
      '  FOO_KEY: Joi.string(),\n  /* cfsa:env */',
    );
  });
});

describe('mergeDeps', () => {
  it('adds missing packages and never changes existing versions', () => {
    const pkg = { name: 'x', dependencies: { a: '^1.0.0' } };
    const out = mergeDeps(pkg, { a: '^2.0.0', b: '^3.0.0' }, { c: '^1.0.0' });
    expect(out.dependencies).toEqual({ a: '^1.0.0', b: '^3.0.0' });
    expect(out.devDependencies).toEqual({ c: '^1.0.0' });
    expect(pkg.dependencies).toEqual({ a: '^1.0.0' });
  });
});
