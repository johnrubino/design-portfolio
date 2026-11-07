/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_WALKTHROUGH_ENDPOINT?: string;
  readonly VITE_WALKTHROUGH_STUB?: string;
  readonly VITE_ROUTER?: 'hash' | 'path';
}
