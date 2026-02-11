import React from 'react'
import { uploadImageToCloudinary, type CloudinaryUploadResult } from '../services/cloudinary.service'

const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE_MB = 5

interface UploadImageFormProps {
  onImageUploaded?: (result: CloudinaryUploadResult) => void
  maxFileSizeMb?: number
}

export default function UploadImageForm({
  onImageUploaded,
  maxFileSizeMb = MAX_FILE_SIZE_MB
}: UploadImageFormProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = React.useState<CloudinaryUploadResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submissionMessage, setSubmissionMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!selectedFile) {
      return
    }
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  const validateFile = (file: File) => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      throw new Error('Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP')
    }
    const maxBytes = maxFileSizeMb * 1024 * 1024
    if (file.size > maxBytes) {
      throw new Error(`Dung lượng tối đa ${maxFileSizeMb}MB`)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    try {
      validateFile(file)
      setError(null)
      setUploadedImage(null)
      setSubmissionMessage(null)
      setSelectedFile(file)
    } catch (validationError) {
      const message = validationError instanceof Error ? validationError.message : 'File không hợp lệ'
      setError(message)
      setSelectedFile(null)
      setPreviewUrl(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn một ảnh trước khi upload')
      return
    }

    setIsUploading(true)
    setError(null)
    try {
      const result = await uploadImageToCloudinary(selectedFile)
      setUploadedImage(result)
      setSubmissionMessage(null)
      onImageUploaded?.(result)
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Không thể tải ảnh lên Cloudinary'
      setError(message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleMockSubmit = async () => {
    if (!uploadedImage?.secureUrl) {
      setError('Cần upload ảnh trước khi submit form nghiệp vụ')
      return
    }

    setIsSubmitting(true)
    setSubmissionMessage(null)
    setError(null)

    // Giả lập API tạo sản phẩm chỉ nhận URL ảnh đã upload
    await new Promise((resolve) => setTimeout(resolve, 1200))

    setSubmissionMessage(
      `Đã gửi form giả lập với ảnh ${uploadedImage.originalFilename} - URL: ${uploadedImage.secureUrl}`
    )
    setIsSubmitting(false)
  }

  return (
    <div className='w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
      <h2 className='mb-4 text-xl font-semibold text-gray-900'>Upload ảnh sản phẩm</h2>

      <label className='block text-sm font-medium text-gray-700'>Chọn ảnh</label>
      <input
        type='file'
        accept='image/jpeg,image/png,image/webp'
        onChange={handleFileChange}
        className='mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm'
      />
      <p className='mt-1 text-xs text-gray-500'>Tối đa {maxFileSizeMb}MB · Hỗ trợ JPG, PNG, WEBP</p>

      {error && <p className='mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700'>{error}</p>}

      {previewUrl && (
        <div className='mt-4'>
          <p className='text-sm font-medium text-gray-700'>Preview trước khi upload</p>
          <img
            src={previewUrl}
            alt='Preview ảnh'
            className='mt-2 h-48 w-full rounded-lg object-cover shadow-inner'
          />
        </div>
      )}

      <div className='mt-5 flex items-center gap-3'>
        <button
          type='button'
          onClick={handleUpload}
          disabled={isUploading}
          className='rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-60'
        >
          {isUploading ? 'Đang upload...' : 'Upload lên Cloudinary'}
        </button>

        <button
          type='button'
          onClick={handleMockSubmit}
          disabled={!uploadedImage || isSubmitting}
          className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 disabled:opacity-40'
        >
          {isSubmitting ? 'Đang submit...' : 'Giả lập submit URL'}
        </button>
      </div>

      {uploadedImage && (
        <div className='mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900'>
          <p className='font-medium'>Upload thành công!</p>
          <p>public_id: {uploadedImage.publicId}</p>
          <a
            href={uploadedImage.secureUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='text-green-800 underline'
          >
            Xem ảnh đã upload
          </a>
        </div>
      )}

      {submissionMessage && (
        <div className='mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900'>
          {submissionMessage}
        </div>
      )}
    </div>
  )
}
