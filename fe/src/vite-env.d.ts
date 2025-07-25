/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_BE_URL: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
