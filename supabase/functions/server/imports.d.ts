// Declarations to help the TypeScript language server resolve Deno/npm-style imports
// These are ambient module declarations that silence editor/type-checker errors
// when using `npm:` imports inside Edge Functions (Deno runtime / bundler resolves them at build time).

declare module "npm:groq-sdk";
declare module "npm:hono";
declare module "npm:hono/cors";
declare module "npm:hono/logger";
declare module "npm:@supabase/supabase-js@2";
declare module "npm:@supabase/supabase-js";

// NOTE: Do not declare relative local modules here (ambient module declarations
// cannot use relative paths). Local files like `kv_store.tsx` are TypeScript
// modules resolved by the project; if your editor still complains, consider
// adding a small `types` file or configure `tsconfig.json` includes.
