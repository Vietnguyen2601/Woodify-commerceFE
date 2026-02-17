import React from 'react'
import { provinceApi } from './provinceApi'
import type {
  AddressFormField,
  AddressFormState,
  AddressModalProps,
  FormErrors,
  PickupAddressPayload,
  Province,
  District,
  Ward,
} from './types'

const PHONE_REGEX = /^(\+?84|0)(3|5|7|8|9)\d{8}$/

const buildFormState = (value?: PickupAddressPayload | null): AddressFormState => ({
  fullName: value?.fullName ?? '',
  phone: value?.phone ?? '',
  provinceCode: value?.provinceCode ? String(value.provinceCode) : '',
  districtCode: value?.districtCode ? String(value.districtCode) : '',
  wardCode: value?.wardCode ? String(value.wardCode) : '',
  detailAddress: value?.detailAddress ?? '',
  isDefault: value?.isDefault ?? false,
})

const createTouchedState = (): Record<AddressFormField, boolean> => ({
  fullName: false,
  phone: false,
  provinceCode: false,
  districtCode: false,
  wardCode: false,
  detailAddress: false,
})

const validateAddress = (values: AddressFormState): FormErrors => {
  const nextErrors: FormErrors = {}

  if (!values.fullName.trim()) {
    nextErrors.fullName = 'Vui lòng nhập họ tên'
  }

  if (!values.phone.trim()) {
    nextErrors.phone = 'Vui lòng nhập số điện thoại'
  } else if (!PHONE_REGEX.test(values.phone.trim())) {
    nextErrors.phone = 'Số điện thoại không hợp lệ'
  }

  if (!values.provinceCode) {
    nextErrors.provinceCode = 'Vui lòng chọn tỉnh/thành phố'
  }

  if (!values.districtCode) {
    nextErrors.districtCode = 'Vui lòng chọn quận/huyện'
  }

  if (!values.wardCode) {
    nextErrors.wardCode = 'Vui lòng chọn phường/xã'
  }

  if (!values.detailAddress.trim()) {
    nextErrors.detailAddress = 'Vui lòng nhập địa chỉ chi tiết'
  }

  return nextErrors
}

const LoadingSpinner = () => (
  <span
    aria-hidden='true'
    className='pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-yellow-900/60 border-t-transparent'
  />
)

const SelectChevron = () => (
  <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400'>⌄</span>
)

export default function AddressModal({ isOpen, onClose, onSave, initialValue }: AddressModalProps) {
  const [formValues, setFormValues] = React.useState<AddressFormState>(() => buildFormState(initialValue))
  const [touched, setTouched] = React.useState<Record<AddressFormField, boolean>>(() => createTouchedState())
  const [submitted, setSubmitted] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  const [provinces, setProvinces] = React.useState<Province[]>([])
  const [districts, setDistricts] = React.useState<District[]>([])
  const [wards, setWards] = React.useState<Ward[]>([])

  const [provinceLoading, setProvinceLoading] = React.useState(false)
  const [districtLoading, setDistrictLoading] = React.useState(false)
  const [wardLoading, setWardLoading] = React.useState(false)

  const [provinceError, setProvinceError] = React.useState<string | null>(null)
  const [districtError, setDistrictError] = React.useState<string | null>(null)
  const [wardError, setWardError] = React.useState<string | null>(null)

  const titleId = React.useId()
  const fullNameId = React.useId()
  const phoneId = React.useId()
  const provinceId = React.useId()
  const districtId = React.useId()
  const wardId = React.useId()
  const detailId = React.useId()

  const validationErrors = React.useMemo(() => validateAddress(formValues), [formValues])
  const isFormValid = Object.keys(validationErrors).length === 0

  const showError = (field: AddressFormField) => {
    if (!submitted && !touched[field]) {
      return undefined
    }
    return validationErrors[field]
  }

  const markTouched = (field: AddressFormField) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }))
  }

  const resetFormState = React.useCallback(
    (value?: PickupAddressPayload | null) => {
      setFormValues(buildFormState(value))
      setTouched(createTouchedState())
      setSubmitted(false)
    },
    [],
  )

  React.useEffect(() => {
    if (!isOpen) return
    resetFormState(initialValue)
  }, [initialValue, isOpen, resetFormState])

  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    let cancelled = false
    const controller = new AbortController()
    setProvinceLoading(true)
    setProvinceError(null)

    provinceApi
      .getProvinces(controller.signal)
      .then((data) => {
        if (!cancelled) {
          setProvinces(data)
        }
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        console.error('Failed to load provinces', error)
        if (!cancelled) {
          setProvinceError('Không thể tải danh sách tỉnh/thành.')
          setProvinces([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setProvinceLoading(false)
        }
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [isOpen])

  React.useEffect(() => {
    if (!isOpen) return

    if (!formValues.provinceCode) {
      setDistricts([])
      setDistrictError(null)
      setDistrictLoading(false)
      return
    }

    const code = Number(formValues.provinceCode)
    if (!Number.isFinite(code)) {
      return
    }

    let cancelled = false
    const controller = new AbortController()
    setDistrictLoading(true)
    setDistrictError(null)

    provinceApi
      .getDistricts(code, controller.signal)
      .then((data) => {
        if (!cancelled) {
          setDistricts(data)
        }
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        console.error('Failed to load districts', error)
        if (!cancelled) {
          setDistrictError('Không thể tải danh sách quận/huyện.')
          setDistricts([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDistrictLoading(false)
        }
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [formValues.provinceCode, isOpen])

  React.useEffect(() => {
    if (!isOpen) return

    if (!formValues.districtCode) {
      setWards([])
      setWardError(null)
      setWardLoading(false)
      return
    }

    const code = Number(formValues.districtCode)
    if (!Number.isFinite(code)) {
      return
    }

    let cancelled = false
    const controller = new AbortController()
    setWardLoading(true)
    setWardError(null)

    provinceApi
      .getWards(code, controller.signal)
      .then((data) => {
        if (!cancelled) {
          setWards(data)
        }
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        console.error('Failed to load wards', error)
        if (!cancelled) {
          setWardError('Không thể tải danh sách phường/xã.')
          setWards([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setWardLoading(false)
        }
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [formValues.districtCode, isOpen])

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormValues((prev) => {
      if (name === 'provinceCode') {
        return {
          ...prev,
          provinceCode: value,
          districtCode: '',
          wardCode: '',
        }
      }

      if (name === 'districtCode') {
        return {
          ...prev,
          districtCode: value,
          wardCode: '',
        }
      }

      return {
        ...prev,
        [name]: value,
      }
    })

    if (name === 'provinceCode') {
      setDistricts([])
      setWards([])
      setDistrictError(null)
      setWardError(null)
    } else if (name === 'districtCode') {
      setWards([])
      setWardError(null)
    }
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({
      ...prev,
      isDefault: event.target.checked,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)

    const currentErrors = validateAddress(formValues)
    if (Object.keys(currentErrors).length > 0) {
      return
    }

    const province = provinces.find((item) => String(item.code) === formValues.provinceCode)
    const district = districts.find((item) => String(item.code) === formValues.districtCode)
    const ward = wards.find((item) => String(item.code) === formValues.wardCode)

    if (!province || !district || !ward) {
      return
    }

    const payload: PickupAddressPayload = {
      fullName: formValues.fullName.trim(),
      phone: formValues.phone.trim(),
      provinceCode: province.code,
      provinceName: province.name,
      districtCode: district.code,
      districtName: district.name,
      wardCode: ward.code,
      wardName: ward.name,
      detailAddress: formValues.detailAddress.trim(),
      isDefault: formValues.isDefault,
    }

    try {
      setIsSaving(true)
      await onSave(payload)
    } catch (error) {
      console.error('Failed to save address', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleOverlayMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 px-4 py-8'
      onMouseDown={handleOverlayMouseDown}
      role='presentation'
    >
      <div
        aria-labelledby={titleId}
        aria-modal='true'
        className='flex max-h-[90vh] w-full max-w-[640px] flex-col overflow-hidden rounded-xl bg-white shadow-lg'
        role='dialog'
      >
        <header className='border-b border-stone-100 px-6 py-4'>
          <div className='flex items-start justify-between'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.25em] text-stone-500'>Lấy hàng</p>
              <h2 className='text-lg font-semibold text-stone-900' id={titleId}>
                Thêm Địa Chỉ Mới
              </h2>
            </div>
            <button
              type='button'
              className='rounded-full border border-stone-200 p-2 text-stone-500 transition hover:text-stone-900'
              onClick={onClose}
              aria-label='Đóng'
            >
              ✕
            </button>
          </div>
        </header>

        <form className='flex flex-1 flex-col' onSubmit={handleSubmit} noValidate>
          <div className='flex-1 space-y-5 overflow-y-auto px-6 py-6'>
            <div className='grid gap-4 md:grid-cols-2'>
              <Field label='Họ & Tên' inputId={fullNameId} required error={showError('fullName')}>
                <input
                  id={fullNameId}
                  name='fullName'
                  type='text'
                  placeholder='Nhập vào'
                  value={formValues.fullName}
                  onChange={handleTextChange}
                  onBlur={() => markTouched('fullName')}
                  className='h-11 w-full rounded-xl border border-stone-200 px-3 text-sm outline-none focus:border-yellow-900'
                />
              </Field>
              <Field label='Số điện thoại (+84)' inputId={phoneId} required error={showError('phone')}>
                <input
                  id={phoneId}
                  name='phone'
                  type='tel'
                  placeholder='Nhập vào'
                  value={formValues.phone}
                  onChange={handleTextChange}
                  onBlur={() => markTouched('phone')}
                  className='h-11 w-full rounded-xl border border-stone-200 px-3 text-sm outline-none focus:border-yellow-900'
                />
              </Field>
            </div>

            <Field label='Tỉnh/Thành phố' inputId={provinceId} required error={showError('provinceCode')} helperText={provinceError}>
              <div className='relative'>
                <select
                  id={provinceId}
                  name='provinceCode'
                  value={formValues.provinceCode}
                  onChange={handleSelectChange}
                  onBlur={() => markTouched('provinceCode')}
                  disabled={provinceLoading}
                  className='h-11 w-full appearance-none rounded-xl border border-stone-200 bg-white px-3 pr-10 text-sm outline-none focus:border-yellow-900 disabled:bg-stone-50'
                >
                  <option value=''>{provinceLoading ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
                <SelectChevron />
                {provinceLoading && <LoadingSpinner />}
              </div>
            </Field>

            <div className='grid gap-4 md:grid-cols-2'>
              <Field
                label='Quận/Huyện'
                inputId={districtId}
                required
                error={showError('districtCode')}
                helperText={!formValues.provinceCode ? 'Chọn tỉnh trước' : districtError}
              >
                <div className='relative'>
                  <select
                    id={districtId}
                    name='districtCode'
                    value={formValues.districtCode}
                    onChange={handleSelectChange}
                    onBlur={() => markTouched('districtCode')}
                    disabled={!formValues.provinceCode || districtLoading}
                    className='h-11 w-full appearance-none rounded-xl border border-stone-200 bg-white px-3 pr-10 text-sm outline-none focus:border-yellow-900 disabled:bg-stone-50'
                  >
                    <option value=''>
                      {!formValues.provinceCode ? 'Chọn tỉnh trước' : districtLoading ? 'Đang tải...' : 'Chọn quận/huyện'}
                    </option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  <SelectChevron />
                  {districtLoading && <LoadingSpinner />}
                </div>
              </Field>

              <Field
                label='Phường/Xã'
                inputId={wardId}
                required
                error={showError('wardCode')}
                helperText={!formValues.districtCode ? 'Chọn quận trước' : wardError}
              >
                <div className='relative'>
                  <select
                    id={wardId}
                    name='wardCode'
                    value={formValues.wardCode}
                    onChange={handleSelectChange}
                    onBlur={() => markTouched('wardCode')}
                    disabled={!formValues.districtCode || wardLoading}
                    className='h-11 w-full appearance-none rounded-xl border border-stone-200 bg-white px-3 pr-10 text-sm outline-none focus:border-yellow-900 disabled:bg-stone-50'
                  >
                    <option value=''>
                      {!formValues.districtCode ? 'Chọn quận trước' : wardLoading ? 'Đang tải...' : 'Chọn phường/xã'}
                    </option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                  <SelectChevron />
                  {wardLoading && <LoadingSpinner />}
                </div>
              </Field>
            </div>

            <Field label='Địa chỉ chi tiết' inputId={detailId} required error={showError('detailAddress')}>
              <textarea
                id={detailId}
                name='detailAddress'
                rows={3}
                placeholder='Số nhà, tên đường, mô tả bổ sung...'
                value={formValues.detailAddress}
                onChange={handleTextChange}
                onBlur={() => markTouched('detailAddress')}
                className='w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-yellow-900'
              />
            </Field>

            <label className='flex items-start gap-3 text-sm text-stone-600'>
              <input
                type='checkbox'
                className='mt-1 h-4 w-4 rounded border-stone-300'
                checked={formValues.isDefault}
                onChange={handleCheckboxChange}
              />
              <span>Đặt làm địa chỉ mặc định</span>
            </label>
          </div>

          <div className='border-t border-stone-100 px-6 py-4'>
            <div className='flex w-full items-center justify-end gap-3'>
              <button
                type='button'
                className='rounded-full px-5 py-2 text-sm font-semibold text-stone-500 transition hover:text-stone-800'
                onClick={onClose}
              >
                Hủy
              </button>
              <button
                type='submit'
                disabled={!isFormValid || isSaving}
                className={`rounded-full px-6 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed ${
                  !isFormValid || isSaving ? 'bg-stone-300' : 'bg-yellow-900 hover:bg-yellow-800'
                }`}
              >
                {isSaving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

interface FieldProps {
  label: string
  inputId: string
  required?: boolean
  error?: string
  helperText?: string | null
  children: React.ReactNode
}

function Field({ label, inputId, required, error, helperText, children }: FieldProps) {
  return (
    <div className='flex flex-col gap-2 text-sm text-stone-700'>
      <label htmlFor={inputId} className='text-xs font-semibold uppercase tracking-wide text-stone-500'>
        {label}
        {required && <span className='ml-1 text-rose-600'>*</span>}
      </label>
      {children}
      {error ? <span className='text-xs text-rose-600'>{error}</span> : helperText ? <span className='text-xs text-stone-500'>{helperText}</span> : null}
    </div>
  )
}
