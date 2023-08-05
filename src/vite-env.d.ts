declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGElement>>;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_PICKER_RADIUS: number;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
