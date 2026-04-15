declare module 'tiged' {
  interface DegitOptions {
    cache?: boolean;
    force?: boolean;
    verbose?: boolean;
    mode?: 'tar' | 'git';
    subgroup?: boolean;
    'sub-directory'?: string;
    disableCache?: boolean;
  }
  interface Emitter {
    clone(dest: string): Promise<void>;
    on(event: string, cb: (info: unknown) => void): this;
  }
  function tiged(src: string, opts?: DegitOptions): Emitter;
  export = tiged;
}
