const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dp73ww7yl/image/upload'
const CLOUDINARY_UPLOAD_PRESET = 'fe_unsigned_upload'
const CLOUDINARY_ASSET_FOLDER = 'fe-uploads'

interface CloudinaryUploadSuccess {
  secure_url: string
  public_id: string
  asset_id?: string
  original_filename?: string
}

export interface CloudinaryUploadResult {
  secureUrl: string
  publicId: string
  originalFilename: string
}

/**
 * Upload a single image file directly to Cloudinary via unsigned upload.
 */
export async function uploadImageToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', CLOUDINARY_ASSET_FOLDER)

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Cloudinary upload failed: ${errorText}`)
  }

  const data = (await response.json()) as CloudinaryUploadSuccess

  if (!data.secure_url || !data.public_id) {
    throw new Error('Tải ảnh thất bại – thiếu dữ liệu trả về')
  }

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    originalFilename: data.original_filename ?? file.name
  }
}
