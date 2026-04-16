/// <reference types="vite/client" />

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_IDENTITY_SERVICE_URL?: string
  readonly VITE_SHOP_SERVICE_URL?: string
  readonly VITE_PRODUCT_SERVICE_URL?: string
  readonly VITE_WALLET_SERVICE_URL?: string
  readonly VITE_PROVIDER_SERVICE_URL?: string
  readonly VITE_SHOP_REGISTER_SERVICE_URL?: string
  readonly VITE_CLOUDINARY_CLOUD_NAME: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string
  readonly VITE_CLOUDINARY_ASSET_FOLDER?: string
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
