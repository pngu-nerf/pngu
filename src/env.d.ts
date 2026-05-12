/// <reference path="../.astro/types.d.ts" />

// Build-time env vars consumed by src/lib/r2.ts. Declared here so
// process.env.R2_* is typed during `astro build`.
declare namespace NodeJS {
  interface ProcessEnv {
    R2_ACCESS_KEY_ID?: string;
    R2_SECRET_ACCESS_KEY?: string;
  }
}
