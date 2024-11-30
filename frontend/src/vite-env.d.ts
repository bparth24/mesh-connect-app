/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_MESH_MIDDLEWARE_API_BASE_URL: string
  readonly VITE_APP_CLIENT_ID: string
  readonly VITE_APP_CLIENT_SECRET: string
  readonly VITE_APP_LINK_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
