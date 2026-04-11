export const currency = (v: number | undefined | null) => {
  if (v === undefined || v === null) {
    return '0 VND'
  }
  return v.toLocaleString('vi-VN') + ' VND'
}
