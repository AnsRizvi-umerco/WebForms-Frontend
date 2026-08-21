/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_MASTER_PORTAL_BASE_URL: string;
  readonly VITE_SHOW_JSON: string;
  readonly VITE_USE_DUMMY_DASHBOARD_DATA: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
