/**
 * API tỉnh/thành công khai (Việt Nam). Ghi đè bằng `VITE_PROVINCES_API_URL` trong `.env` nếu cần proxy.
 */
export function getProvincesOpenApiBase(): string {
  const raw = import.meta.env.VITE_PROVINCES_API_URL?.trim()
  if (raw) return raw.replace(/\/$/, '')
  return 'https://provinces.open-api.vn/api/v1'
}
