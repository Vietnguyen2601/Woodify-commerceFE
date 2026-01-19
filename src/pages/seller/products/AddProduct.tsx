import React, { DragEvent, useEffect, useMemo, useRef, useState } from 'react'
import '../../../styles/addProduct.css'

type TabKey = 'basic' | 'material' | 'media' | 'selling' | 'shipping' | 'misc'

interface ImageAsset {
  id: string
  name: string
  dataUrl: string
}

interface VariantAttributeMap {
  Finish: string[]
  Thickness: string[]
  Size: string[]
}

interface VariantRow {
  id: string
  sku: string
  attributes: Record<string, string>
  price: string
  stock: string
  weight: string
  leadTime: string
}

interface BulkTier {
  id: string
  min_qty: string
  price_per_unit: string
}

interface FormDimensions {
  length: string
  width: string
  thickness: string
  tolerance: string
  weight: string
  loadCapacity: string
}

interface SellingInfo {
  price: string
  stock: string
  moq: string
  sellBy: 'unit' | 'sqm' | 'linear' | 'bundle'
  unit: string
  conversionNote: string
  leadTime: string
  warranty: string
  customSizeEnabled: boolean
  customSize: {
    length: string
    width: string
    height: string
    note: string
  }
}

interface ShippingInfo {
  packedLength: string
  packedWidth: string
  packedHeight: string
  packedWeight: string
  requiresCrate: boolean
  crateFee: string
  palletized: boolean
  forklift: boolean
  localShipping: boolean
  palletShipping: boolean
  freightShipping: boolean
  referenceFee: string
  criticalNotes: string
  handlingNotes: string
}

interface OtherInfo {
  condition: 'new' | 'refurbished' | 'second-hand'
  globalSku: string
  tags: string[]
  legalCompliance: boolean
}

interface FormState {
  title: string
  category: string
  productSku: string
  supplierSku: string
  video: string
  woodType: string
  grade: string
  kilnDried: boolean
  moisturePercent: string
  surfaceTreatment: string
  fscCertified: boolean
  fscCertificateFile: string
  origin: string
  secondaryMaterial: string
  dimensions: FormDimensions
  joinery: string
  assemblyRequired: 'yes' | 'no'
  assemblyDuration: string
  description: string
  installGuideFile: string
  selling: SellingInfo
  shipping: ShippingInfo
  other: OtherInfo
}

const TAB_LIST: { key: TabKey; label: string }[] = [
  { key: 'basic', label: 'Thông tin cơ bản' },
  { key: 'material', label: 'Thông tin vật liệu' },
  { key: 'media', label: 'Mô tả & Hình ảnh' },
  { key: 'selling', label: 'Thông tin bán hàng' },
  { key: 'shipping', label: 'Vận chuyển & Đóng gói' },
  { key: 'misc', label: 'Thông tin khác' }
]

const CATEGORY_OPTIONS = ['Bàn', 'Ghế', 'Ván sàn', 'Tủ', 'Phụ kiện']
const WOOD_TYPES = ['Teak', 'Oak', 'Walnut', 'Rubberwood', 'Pine', 'Acacia']
const SURFACE_TREATMENTS = ['Oiled', 'Varnished', 'Lacquered', 'Untreated', 'Waxed']
const GRADES = ['Select', 'A', 'B', 'C']
const JOINERY_OPTIONS = ['Dovetail', 'Mortise & Tenon', 'Finger Joint', 'Butt Joint', 'Half-lap', 'Biscuit']
const SELLING_UNITS = [
  { label: 'Theo sản phẩm', value: 'unit', unit: 'cái' },
  { label: 'Theo m2', value: 'sqm', unit: 'm²' },
  { label: 'Theo mét dài', value: 'linear', unit: 'm' },
  { label: 'Theo kiện/khối', value: 'bundle', unit: 'kiện' }
]
const CHECKLIST_ITEMS = ['Ảnh toàn cảnh sản phẩm', 'Ảnh cận vân gỗ', 'Ảnh cạnh và mép', 'Ảnh bao bì/đóng gói', 'Ảnh hướng dẫn/assembly']

const JSON_SCHEMA = {
  title: 'wood_product',
  type: 'object',
  required: ['title', 'category', 'wood_type', 'price', 'images'],
  properties: {
    title: { type: 'string', maxLength: 150 },
    category: { type: 'string' },
    sku: { type: 'string' },
    images: { type: 'array', minItems: 1, items: { type: 'string', format: 'data-url' } },
    wood_type: { type: 'string' },
    grade: { type: 'string' },
    kiln_dried: { type: 'boolean' },
    moisture_percent: { type: 'number', minimum: 0, maximum: 100 },
    finish: { type: 'string' },
    fsc_certified: { type: 'boolean' },
    fsc_certificate_file: { type: 'string', format: 'data-url' },
    dimensions_cm: {
      type: 'object',
      properties: {
        length: { type: 'number' },
        width: { type: 'number' },
        thickness: { type: 'number' },
        tolerance_mm: { type: 'number' }
      }
    },
    weight_kg: { type: 'number' },
    price: { type: 'number', minimum: 0 },
    stock: { type: 'integer', minimum: 0 },
    moq: { type: 'integer', minimum: 0 },
    variants: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sku: { type: 'string' },
          attributes: { type: 'object' },
          price: { type: 'number' },
          stock: { type: 'integer' },
          lead_time_days: { type: 'integer' }
        }
      }
    },
    bulk_pricing: {
      type: 'array',
      items: {
        type: 'object',
        properties: { min_qty: { type: 'integer' }, price_per_unit: { type: 'number' } }
      }
    },
    shipping: {
      type: 'object',
      properties: {
        packed_dimensions_cm: { type: 'object' },
        packed_weight_kg: { type: 'number' },
        requires_crate: { type: 'boolean' },
        palletized: { type: 'boolean' },
        shipping_notes: { type: 'string' }
      }
    },
    warranty_months: { type: 'integer' }
  }
}

const FIELD_TAB_MAP: Record<string, TabKey> = {
  title: 'basic',
  category: 'basic',
  images: 'basic',
  woodType: 'material',
  dimensions: 'material',
  price: 'selling',
  stock: 'selling',
  variants: 'selling',
  legal: 'misc'
}

const defaultFormState: FormState = {
  title: '',
  category: '',
  productSku: '',
  supplierSku: '',
  video: '',
  woodType: '',
  grade: 'A',
  kilnDried: false,
  moisturePercent: '',
  surfaceTreatment: '',
  fscCertified: false,
  fscCertificateFile: '',
  origin: '',
  secondaryMaterial: '',
  dimensions: {
    length: '',
    width: '',
    thickness: '',
    tolerance: '',
    weight: '',
    loadCapacity: ''
  },
  joinery: '',
  assemblyRequired: 'no',
  assemblyDuration: '',
  description: '',
  installGuideFile: '',
  selling: {
    price: '',
    stock: '',
    moq: '',
    sellBy: 'unit',
    unit: 'cái',
    conversionNote: '',
    leadTime: '',
    warranty: '',
    customSizeEnabled: false,
    customSize: {
      length: '',
      width: '',
      height: '',
      note: ''
    }
  },
  shipping: {
    packedLength: '',
    packedWidth: '',
    packedHeight: '',
    packedWeight: '',
    requiresCrate: false,
    crateFee: '',
    palletized: false,
    forklift: false,
    localShipping: true,
    palletShipping: false,
    freightShipping: false,
    referenceFee: '',
    criticalNotes: '',
    handlingNotes: ''
  },
  other: {
    condition: 'new',
    globalSku: '',
    tags: [],
    legalCompliance: false
  }
}

const VARIANT_TEMPLATE: VariantAttributeMap = {
  Finish: ['Oiled', 'Lacquered', 'Stained'],
  Thickness: ['20mm', '30mm', '40mm'],
  Size: ['S', 'M', 'L']
}

const randomId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`

const deepClone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

const readFileAsDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

const estimateWeight = (length: number, width: number, thickness: number, density = 0.68) => {
  const volumeMeters = (length / 100) * (width / 100) * (thickness / 1000)
  return Number((volumeMeters * density * 1000).toFixed(1))
}

export default function AddProduct() {
  const [activeTab, setActiveTab] = useState<TabKey>('basic')
  const [formState, setFormState] = useState<FormState>(defaultFormState)
  const [images, setImages] = useState<ImageAsset[]>([])
  const [videoAsset, setVideoAsset] = useState<string>('')
  const [variantAttributes, setVariantAttributes] = useState<VariantAttributeMap>({
    Finish: [],
    Thickness: [],
    Size: []
  })
  const [variants, setVariants] = useState<VariantRow[]>([])
  const [bulkPricing, setBulkPricing] = useState<BulkTier[]>([{ id: randomId(), min_qty: '', price_per_unit: '' }])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showExportModal, setShowExportModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [exportJson, setExportJson] = useState('')
  const [autosaveLabel, setAutosaveLabel] = useState('Chưa lưu')
  const [hasChanges, setHasChanges] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const tabRefs = useRef<Record<TabKey, HTMLDivElement | null>>({} as Record<TabKey, HTMLDivElement | null>)
  const hasChangesRef = useRef(false)

  const charCount = useMemo(() => formState.description.length, [formState.description])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasChanges) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  useEffect(() => {
    hasChangesRef.current = hasChanges
  }, [hasChanges])

  useEffect(() => {
    const interval = setInterval(() => {
      if (hasChangesRef.current) {
        setAutosaveLabel(`Đã lưu nháp ${new Date().toLocaleTimeString('vi-VN')}`)
        setHasChanges(false)
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const activeAttributes = Object.entries(variantAttributes).filter(([, values]) => values.length)
    if (!activeAttributes.length) {
      setVariants([])
      return
    }
    const combos = activeAttributes.reduce<string[][]>((acc, [, values]) => {
      const result: string[][] = []
      acc.forEach(combo => {
        values.forEach((value: string) => result.push([...combo, value]))
      })
      return result
    }, [[]])
    setVariants(prev =>
      combos.map(combo => {
        const attributes = combo.reduce<Record<string, string>>((map, value, index) => {
          const key = activeAttributes[index][0]
          map[key] = value
          return map
        }, {})
        const existing = prev.find(row => JSON.stringify(row.attributes) === JSON.stringify(attributes))
        return (
          existing ?? {
            id: randomId(),
            sku: '',
            attributes,
            price: '',
            stock: '',
            weight: '',
            leadTime: ''
          }
        )
      })
    )
  }, [variantAttributes])

  const handleFieldChange = (path: string, value: unknown) => {
    setFormState(prev => {
      const next = deepClone(prev)
      const segments = path.split('.')
      let cursor: any = next
      segments.slice(0, -1).forEach(segment => {
        cursor = cursor[segment]
      })
      cursor[segments.at(-1) as string] = value
      return next
    })
    setHasChanges(true)
  }

  const handleDimensionChange = (field: keyof FormDimensions, value: string) => {
    handleFieldChange(`dimensions.${field}`, value)
    if (['length', 'width', 'thickness'].includes(field)) {
      const length = Number(field === 'length' ? value : formState.dimensions.length)
      const width = Number(field === 'width' ? value : formState.dimensions.width)
      const thickness = Number(field === 'thickness' ? value : formState.dimensions.thickness)
      if (length && width && thickness) {
        const weightEstimate = estimateWeight(length, width, thickness)
        handleFieldChange('dimensions.weight', weightEstimate.toString())
      }
    }
  }

  const handleImageUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return
    const maxSize = 5 * 1024 * 1024
    const files = Array.from(fileList)
    const validFiles = files.filter(file => file.type.startsWith('image/') && file.size <= maxSize)
    if (!validFiles.length) {
      setErrors(prev => ({ ...prev, images: 'Chỉ chấp nhận JPG/PNG/WEBP ≤ 5MB' }))
      setUploadStatus('Không có tệp hợp lệ')
      return
    }
    setUploadStatus('Đang tải ảnh...')
    const assets: ImageAsset[] = await Promise.all(
      validFiles.map(async file => ({ id: randomId(), name: file.name, dataUrl: await readFileAsDataUrl(file) }))
    )
    setImages(prev => {
      const next = [...prev, ...assets].slice(0, 8)
      setHasChanges(true)
      return next
    })
    setErrors(prev => {
      const next = { ...prev }
      delete next.images
      return next
    })
    const rejected = files.length - validFiles.length
    setUploadStatus(`Đã thêm ${assets.length} ảnh${rejected ? ` · loại ${rejected} tệp` : ''}`)
  }

  const dragItem = useRef<ImageAsset | null>(null)

  const handleDragStart = (asset: ImageAsset) => (event: DragEvent<HTMLDivElement>) => {
    dragItem.current = asset
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (target: ImageAsset) => (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!dragItem.current || dragItem.current.id === target.id) return
    setImages(prev => {
      const draggedIndex = prev.findIndex(img => img.id === dragItem.current?.id)
      const targetIndex = prev.findIndex(img => img.id === target.id)
      const next = [...prev]
      const [removed] = next.splice(draggedIndex, 1)
      next.splice(targetIndex, 0, removed)
      setHasChanges(true)
      return next
    })
    dragItem.current = null
  }

  const handleImageDelete = (assetId: string) => {
    setImages(prev => prev.filter(img => img.id !== assetId))
    setHasChanges(true)
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}
    if (!images.length) {
      nextErrors.images = 'Cần ≥1 ảnh (khuyến nghị ≥3 với đủ góc nhìn)'
    }
    if (!formState.title.trim()) {
      nextErrors.title = 'Tên sản phẩm bắt buộc'
    }
    if (!formState.category) {
      nextErrors.category = 'Chọn danh mục'
    }
    if (!formState.woodType) {
      nextErrors.woodType = 'Chọn loại gỗ'
    }
    const { length, width, thickness } = formState.dimensions
    if (!formState.selling.customSizeEnabled && (!length || !width || !thickness)) {
      nextErrors.dimensions = 'Cung cấp kích thước cơ bản'
    }
    if (!formState.selling.price && !variants.length) {
      nextErrors.price = 'Nhập giá hoặc cấu hình variant'
    }
    if (!formState.selling.stock && !variants.length) {
      nextErrors.stock = 'Nhập tồn kho hoặc variant'
    }
    const variantError = variants.some(row => !row.price || !row.stock)
    if (variantError) {
      nextErrors.variants = 'Mỗi biến thể cần giá và tồn kho'
    }
    if (!formState.other.legalCompliance && !formState.fscCertified) {
      nextErrors.legal = 'Xác nhận tuân thủ nguồn gốc khi không có FSC'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      const targetField = Object.keys(nextErrors)[0]
      const targetTab = FIELD_TAB_MAP[targetField] ?? 'basic'
      setActiveTab(targetTab)
      tabRefs.current[targetTab]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    return !Object.keys(nextErrors).length
  }

  const buildSamplePayload = () => {
    return {
      title: formState.title,
      category: formState.category,
      sku: formState.productSku,
      images: images.map(img => img.dataUrl),
      wood_type: formState.woodType,
      grade: formState.grade,
      kiln_dried: formState.kilnDried,
      moisture_percent: Number(formState.moisturePercent) || undefined,
      finish: formState.surfaceTreatment,
      fsc_certified: formState.fscCertified,
      dimensions_cm: {
        length: Number(formState.dimensions.length) || undefined,
        width: Number(formState.dimensions.width) || undefined,
        thickness: Number(formState.dimensions.thickness) || undefined,
        tolerance_mm: Number(formState.dimensions.tolerance) || undefined
      },
      weight_kg: Number(formState.dimensions.weight) || undefined,
      price: Number(formState.selling.price) || undefined,
      stock: Number(formState.selling.stock) || undefined,
      moq: Number(formState.selling.moq) || undefined,
      variants: variants.map(row => ({
        sku: row.sku,
        attributes: row.attributes,
        price: Number(row.price) || 0,
        stock: Number(row.stock) || 0,
        lead_time_days: Number(row.leadTime) || undefined
      })),
      bulk_pricing: bulkPricing
        .filter(tier => tier.min_qty && tier.price_per_unit)
        .map(tier => ({ min_qty: Number(tier.min_qty), price_per_unit: Number(tier.price_per_unit) })),
      shipping: {
        packed_dimensions_cm: {
          length: Number(formState.shipping.packedLength) || undefined,
          width: Number(formState.shipping.packedWidth) || undefined,
          height: Number(formState.shipping.packedHeight) || undefined
        },
        packed_weight_kg: Number(formState.shipping.packedWeight) || undefined,
        requires_crate: formState.shipping.requiresCrate,
        palletized: formState.shipping.palletized,
        shipping_notes: formState.shipping.handlingNotes
      },
      warranty_months: Number(formState.selling.warranty) || undefined
    }
  }

  const handleSave = () => {
    if (!validateForm()) return
    const payload = JSON.stringify(buildSamplePayload(), null, 2)
    setExportJson(payload)
    setShowExportModal(true)
    setAutosaveLabel(`Đã lưu & hiển thị ${new Date().toLocaleTimeString('vi-VN')}`)
    setHasChanges(false)
  }

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelModal(true)
    } else {
      setFormState(defaultFormState)
      setImages([])
      setVariantAttributes({ Finish: [], Thickness: [], Size: [] })
      setVariants([])
      setBulkPricing([{ id: randomId(), min_qty: '', price_per_unit: '' }])
    }
  }

  const confirmDiscard = () => {
    setShowCancelModal(false)
    setHasChanges(false)
    setFormState(defaultFormState)
    setImages([])
    setVariantAttributes({ Finish: [], Thickness: [], Size: [] })
    setVariants([])
    setBulkPricing([{ id: randomId(), min_qty: '', price_per_unit: '' }])
    setUploadStatus('')
  }

  const toggleAttribute = (attribute: keyof VariantAttributeMap, value: string) => {
    setVariantAttributes(prev => {
      const list = prev[attribute]
      const exists = list.includes(value)
      const next = exists ? list.filter(item => item !== value) : [...list, value]
      return { ...prev, [attribute]: next }
    })
    setHasChanges(true)
  }

  const handleVariantChange = (id: string, field: keyof VariantRow, value: string) => {
    setVariants(prev => prev.map(row => (row.id === id ? { ...row, [field]: value } : row)))
    setHasChanges(true)
  }

  const addBulkTier = () => {
    setBulkPricing(prev => [...prev, { id: randomId(), min_qty: '', price_per_unit: '' }])
    setHasChanges(true)
  }

  const updateBulkTier = (tierId: string, field: keyof BulkTier, value: string) => {
    setBulkPricing(prev => prev.map(tier => (tier.id === tierId ? { ...tier, [field]: value } : tier)))
    setHasChanges(true)
  }

  const removeBulkTier = (tierId: string) => {
    setBulkPricing(prev => prev.filter(tier => tier.id !== tierId))
    setHasChanges(true)
  }

  const addTag = (tag: string) => {
    if (!tag.trim()) return
    handleFieldChange('other.tags', [...formState.other.tags, tag.trim()])
  }

  const removeTag = (tag: string) => {
    handleFieldChange('other.tags', formState.other.tags.filter(existing => existing !== tag))
  }

  const renderTabPanel = (key: TabKey, content: React.ReactNode) => (
    <section
      key={key}
      ref={(node: HTMLDivElement | null) => {
        tabRefs.current[key] = node
      }}
      role='tabpanel'
      id={`tab-panel-${key}`}
      aria-labelledby={`tab-${key}`}
      hidden={activeTab !== key}
      className='create-product__panel'
    >
      {content}
    </section>
  )

  return (
    <div className='create-product'>
      <header className='create-product__header'>
        <div>
          <p className='eyebrow'>Tạo sản phẩm</p>
          <h1>Gỗ tinh chọn · Listing chuẩn thương mại</h1>
          <p className='muted'>{autosaveLabel}</p>
        </div>
        <div className='actions'>
          <button type='button' className='ghost' onClick={handleCancel}>
            Hủy
          </button>
          <button type='button' className='primary' onClick={handleSave}>
            Lưu &amp; Hiển thị
          </button>
        </div>
      </header>

      <nav className='create-product__tabs' role='tablist'>
        {TAB_LIST.map(tab => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            className={`tab ${activeTab === tab.key ? 'tab--active' : ''}`}
            role='tab'
            aria-selected={activeTab === tab.key}
            aria-controls={`tab-panel-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {Object.entries(FIELD_TAB_MAP).some(([field, tabKey]) => tabKey === tab.key && errors[field]) && (
              <span className='tab__error-dot' aria-hidden='true'></span>
            )}
          </button>
        ))}
      </nav>

      <form className='create-product__body' onSubmit={event => event.preventDefault()}>
        {renderTabPanel(
          'basic',
          <div className='card-grid'>
            <div className='card'>
              <div className='card__header'>
                <div>
                  <h2>Ảnh &amp; Video</h2>
                  <p>Thiết lập ít nhất 3 ảnh (toàn cảnh, cận vân, cạnh). Ratio 4:3 hoặc 1:1, &lt; 5MB.</p>
                </div>
                <span className='helper'>Kéo thả để sắp xếp</span>
              </div>
              <div
                className={`uploader ${errors.images ? 'uploader--error' : ''}`}
                onDragOver={event => event.preventDefault()}
                onDrop={event => {
                  event.preventDefault()
                  void handleImageUpload(event.dataTransfer.files)
                }}
              >
                <input
                  id='image-upload'
                  type='file'
                  accept='image/*'
                  multiple
                  onChange={event => void handleImageUpload(event.target.files)}
                />
                <label htmlFor='image-upload'>
                  <strong>Kéo &amp; thả / Thêm hình ảnh</strong>
                  <span>Hỗ trợ JPG, PNG, WEBP. Tối ưu 2000 x 2000 px.</span>
                </label>
              </div>
              <p className='small-text muted'>
                {uploadStatus || 'Ưu tiên tối thiểu 3 ảnh (toàn cảnh, vân gỗ, cạnh). Tối đa 5MB/ảnh.'}
              </p>
              {errors.images && <p className='error'>{errors.images}</p>}
              <div className='thumbnail-grid' aria-live='polite'>
                {images.map(asset => (
                  <div
                    key={asset.id}
                    className='thumbnail'
                    draggable
                    onDragStart={handleDragStart(asset)}
                    onDrop={handleDrop(asset)}
                    onDragOver={event => event.preventDefault()}
                    onDragEnd={() => {
                      dragItem.current = null
                    }}
                  >
                    <img src={asset.dataUrl} alt={asset.name} />
                    <button type='button' aria-label='Xóa ảnh' onClick={() => handleImageDelete(asset.id)}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className='video-upload'>
                <label htmlFor='video-upload'>Video (tùy chọn)</label>
                <input
                  id='video-upload'
                  type='file'
                  accept='video/mp4,video/mov'
                  onChange={async event => {
                    if (!event.target.files?.length) return
                    const file = event.target.files[0]
                    const url = await readFileAsDataUrl(file)
                    setVideoAsset(url)
                    setHasChanges(true)
                  }}
                />
                {videoAsset && <video controls src={videoAsset} />}
              </div>
            </div>

            <div className='card'>
              <h2>Thông tin cơ bản</h2>
              <label className={errors.title ? 'invalid' : ''}>
                Tên sản phẩm
                <input
                  type='text'
                  maxLength={150}
                  value={formState.title}
                  aria-invalid={!!errors.title}
                  onChange={event => handleFieldChange('title', event.target.value)}
                  placeholder='VD: Bàn ăn Teak 160 x 90 cm'
                />
                <span className='char-counter'>{formState.title.length}/150</span>
                {errors.title && <span className='error'>{errors.title}</span>}
              </label>
              <label className={errors.category ? 'invalid' : ''}>
                Danh mục
                <select
                  value={formState.category}
                  aria-invalid={!!errors.category}
                  onChange={event => handleFieldChange('category', event.target.value)}
                >
                  <option value=''>Chọn danh mục</option>
                  {CATEGORY_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.category && <span className='error'>{errors.category}</span>}
              </label>
              <label>
                SKU nội bộ
                <input
                  type='text'
                  value={formState.productSku}
                  onChange={event => handleFieldChange('productSku', event.target.value)}
                  placeholder='VD: TEAK-TABLE-160'
                />
              </label>
              <label>
                Mã NCC (tùy chọn)
                <input type='text' value={formState.supplierSku} onChange={event => handleFieldChange('supplierSku', event.target.value)} />
              </label>
            </div>
          </div>
        )}

        {renderTabPanel(
          'material',
          <div className='card-grid'>
            <div className='card'>
              <h2>Thông tin vật liệu</h2>
              <label className={errors.woodType ? 'invalid' : ''}>
                Loại gỗ
                <select value={formState.woodType} aria-invalid={!!errors.woodType} onChange={event => handleFieldChange('woodType', event.target.value)}>
                  <option value=''>Chọn loại gỗ</option>
                  {WOOD_TYPES.map(wood => (
                    <option key={wood} value={wood}>
                      {wood}
                    </option>
                  ))}
                </select>
                {errors.woodType && <span className='error'>{errors.woodType}</span>}
              </label>
              <div className='field-row'>
                <label>
                  Cấp chất lượng
                  <select value={formState.grade} onChange={event => handleFieldChange('grade', event.target.value)}>
                    {GRADES.map(grade => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Độ ẩm (%)
                  <input
                    type='number'
                    min={0}
                    max={100}
                    value={formState.moisturePercent}
                    onChange={event => handleFieldChange('moisturePercent', event.target.value)}
                  />
                </label>
              </div>
              <div className='field-row checkbox-row'>
                <label>
                  <input
                    type='checkbox'
                    checked={formState.kilnDried}
                    onChange={event => handleFieldChange('kilnDried', event.target.checked)}
                  />
                  Kiln-dried (sấy lò)
                </label>
                <label>
                  <input
                    type='checkbox'
                    checked={formState.fscCertified}
                    onChange={event => handleFieldChange('fscCertified', event.target.checked)}
                  />
                  FSC certified
                </label>
              </div>
              {formState.fscCertified && (
                <label>
                  Upload chứng nhận FSC
                  <input
                    type='file'
                    accept='application/pdf,image/*'
                    onChange={async event => {
                      if (!event.target.files?.length) return
                      const file = event.target.files[0]
                      const dataUrl = await readFileAsDataUrl(file)
                      handleFieldChange('fscCertificateFile', dataUrl)
                    }}
                  />
                </label>
              )}
              <label>
                Xử lý bề mặt
                <select value={formState.surfaceTreatment} onChange={event => handleFieldChange('surfaceTreatment', event.target.value)}>
                  <option value=''>Chọn xử lý</option>
                  {SURFACE_TREATMENTS.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Nguồn gốc gỗ
                <input type='text' value={formState.origin} onChange={event => handleFieldChange('origin', event.target.value)} placeholder='VD: Quảng Nam, Việt Nam' />
              </label>
              <label>
                Chất liệu phụ
                <input type='text' value={formState.secondaryMaterial} onChange={event => handleFieldChange('secondaryMaterial', event.target.value)} placeholder='Kim loại, vải, nhựa sinh học...' />
              </label>
            </div>

            <div className='card'>
              <h2>Kích thước &amp; lắp ráp</h2>
              <div className='dimension-grid'>
                <label>
                  Chiều dài (cm)
                  <input type='number' value={formState.dimensions.length} onChange={event => handleDimensionChange('length', event.target.value)} />
                </label>
                <label>
                  Rộng (cm)
                  <input type='number' value={formState.dimensions.width} onChange={event => handleDimensionChange('width', event.target.value)} />
                </label>
                <label>
                  Dày (mm)
                  <input type='number' value={formState.dimensions.thickness} onChange={event => handleDimensionChange('thickness', event.target.value)} />
                </label>
                <label>
                  Sai số (± mm)
                  <input type='number' value={formState.dimensions.tolerance} onChange={event => handleDimensionChange('tolerance', event.target.value)} />
                </label>
              </div>
              <p className='small-text muted'>Tự động ước tính trọng lượng dựa trên mật độ gỗ 0.68 tấn/m³ khi đủ 3 kích thước.</p>
              {errors.dimensions && <span className='error'>{errors.dimensions}</span>}
              <div className='field-row'>
                <label>
                  Trọng lượng (kg)
                  <input type='number' value={formState.dimensions.weight} onChange={event => handleDimensionChange('weight', event.target.value)} />
                </label>
                <label>
                  Tải trọng tối đa (kg)
                  <input type='number' value={formState.dimensions.loadCapacity} onChange={event => handleDimensionChange('loadCapacity', event.target.value)} />
                </label>
              </div>
              <label>
                Cách nối/Joinery
                <input
                  list='joinery-options'
                  value={formState.joinery}
                  onChange={event => handleFieldChange('joinery', event.target.value)}
                  placeholder='Ví dụ: mortise-tenon'
                />
                <datalist id='joinery-options'>
                  {JOINERY_OPTIONS.map(option => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </label>
              <div className='field-row'>
                <label>
                  Assembly required
                  <select value={formState.assemblyRequired} onChange={event => handleFieldChange('assemblyRequired', event.target.value as 'yes' | 'no')}>
                    <option value='no'>Không</option>
                    <option value='yes'>Có</option>
                  </select>
                </label>
                {formState.assemblyRequired === 'yes' && (
                  <label>
                    Thời gian lắp đặt (phút/giờ)
                    <input type='text' value={formState.assemblyDuration} onChange={event => handleFieldChange('assemblyDuration', event.target.value)} />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {renderTabPanel(
          'media',
          <div className='card-grid'>
            <div className='card'>
              <h2>Mô tả chi tiết</h2>
              <label>
                Nội dung mô tả (tối đa 5000 ký tự)
                <textarea
                  maxLength={5000}
                  value={formState.description}
                  onChange={event => handleFieldChange('description', event.target.value)}
                  placeholder='Mô tả gỗ, tiêu chuẩn, hướng dẫn bảo quản...'
                ></textarea>
                <span className='char-counter'>{charCount}/5000</span>
              </label>
              <p className='microcopy'>Ghi rõ thông tin bảo hành và cách bảo quản gỗ.</p>
              <div>
                <p className='small-text'>Checklist gợi ý:</p>
                <ul className='checklist'>
                  {CHECKLIST_ITEMS.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className='guide-upload'>
                <label>Upload hướng dẫn/ sơ đồ (PDF/PNG)</label>
                <input
                  type='file'
                  accept='application/pdf,image/png,image/jpeg'
                  onChange={async event => {
                    if (!event.target.files?.length) return
                    const file = event.target.files[0]
                    const dataUrl = await readFileAsDataUrl(file)
                    handleFieldChange('installGuideFile', dataUrl)
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {renderTabPanel(
          'selling',
          <div className='card-grid'>
            <div className='card'>
              <h2>Giá &amp; tồn kho</h2>
              <div className='field-row'>
                <label className={errors.price ? 'invalid' : ''}>
                  Giá (₫)
                  <input
                    type='number'
                    min={0}
                    aria-invalid={!!errors.price}
                    value={formState.selling.price}
                    onChange={event => handleFieldChange('selling.price', event.target.value)}
                  />
                  {errors.price && <span className='error'>{errors.price}</span>}
                </label>
                <label className={errors.stock ? 'invalid' : ''}>
                  Kho hàng
                  <input
                    type='number'
                    min={0}
                    aria-invalid={!!errors.stock}
                    value={formState.selling.stock}
                    onChange={event => handleFieldChange('selling.stock', event.target.value)}
                  />
                  {errors.stock && <span className='error'>{errors.stock}</span>}
                </label>
              </div>
              <div className='field-row'>
                <label>
                  MOQ
                  <input type='number' min={0} value={formState.selling.moq} onChange={event => handleFieldChange('selling.moq', event.target.value)} />
                </label>
                <label>
                  Bán theo đơn vị
                  <select
                    value={formState.selling.sellBy}
                    onChange={event => {
                      const match = SELLING_UNITS.find(unit => unit.value === event.target.value)
                      handleFieldChange('selling.sellBy', event.target.value)
                      handleFieldChange('selling.unit', match?.unit ?? 'cái')
                    }}
                  >
                    {SELLING_UNITS.map(unit => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {formState.selling.sellBy !== 'unit' && (
                <label>
                  Quy tắc quy đổi / ghi chú
                  <input
                    type='text'
                    value={formState.selling.conversionNote}
                    onChange={event => handleFieldChange('selling.conversionNote', event.target.value)}
                    placeholder='VD: 1 kiện = 2m³'
                  />
                </label>
              )}
              <label>
                Thời gian sản xuất / lead time
                <input
                  type='text'
                  value={formState.selling.leadTime}
                  onChange={event => handleFieldChange('selling.leadTime', event.target.value)}
                  placeholder='VD: 14 ngày'
                />
              </label>
              <label>
                Warranty (tháng)
                <input type='number' min={0} value={formState.selling.warranty} onChange={event => handleFieldChange('selling.warranty', event.target.value)} />
              </label>
            </div>

            <div className='card'>
              <h2>Variant builder</h2>
              <label className='checkbox-inline'>
                <input
                  type='checkbox'
                  checked={formState.selling.customSizeEnabled}
                  onChange={event => handleFieldChange('selling.customSizeEnabled', event.target.checked)}
                />
                Cho phép Custom Size &amp; báo giá theo kích thước
              </label>
              <div className='variant-options'>
                {Object.entries(VARIANT_TEMPLATE).map(([attribute, values]) => (
                  <fieldset key={attribute}>
                    <legend>{attribute}</legend>
                    <div className='chip-group'>
                      {values.map((value: string) => (
                        <label key={value} className={`chip ${variantAttributes[attribute as keyof VariantAttributeMap].includes(value) ? 'chip--active' : ''}`}>
                          <input
                            type='checkbox'
                            checked={variantAttributes[attribute as keyof VariantAttributeMap].includes(value)}
                            onChange={() => toggleAttribute(attribute as keyof VariantAttributeMap, value)}
                          />
                          {value}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
              {formState.selling.customSizeEnabled && (
                <div className='custom-size'>
                  <h3>Custom size</h3>
                  <div className='dimension-grid'>
                    {(['length', 'width', 'height'] as const).map(field => (
                      <label key={field}>
                        {field === 'height' ? 'Cao (cm)' : field === 'length' ? 'Dài (cm)' : 'Rộng (cm)'}
                        <input
                          type='number'
                          value={formState.selling.customSize[field]}
                          onChange={event => handleFieldChange(`selling.customSize.${field}`, event.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                  <label>
                    Ghi chú giá theo kích thước
                    <textarea value={formState.selling.customSize.note} onChange={event => handleFieldChange('selling.customSize.note', event.target.value)}></textarea>
                  </label>
                </div>
              )}
              {!!variants.length && (
                <div className='variant-table-wrapper'>
                  <table>
                    <thead>
                      <tr>
                        <th>Thuộc tính</th>
                        <th>SKU</th>
                        <th>Giá</th>
                        <th>Tồn</th>
                        <th>Trọng lượng</th>
                        <th>Lead time (ngày)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map(row => (
                        <tr key={row.id} className={errors.variants ? 'invalid-row' : ''}>
                          <td>
                            {Object.entries(row.attributes)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(' · ')}
                          </td>
                          <td>
                            <input type='text' value={row.sku} onChange={event => handleVariantChange(row.id, 'sku', event.target.value)} />
                          </td>
                          <td>
                            <input type='number' value={row.price} onChange={event => handleVariantChange(row.id, 'price', event.target.value)} />
                          </td>
                          <td>
                            <input type='number' value={row.stock} onChange={event => handleVariantChange(row.id, 'stock', event.target.value)} />
                          </td>
                          <td>
                            <input type='number' value={row.weight} onChange={event => handleVariantChange(row.id, 'weight', event.target.value)} />
                          </td>
                          <td>
                            <input type='number' value={row.leadTime} onChange={event => handleVariantChange(row.id, 'leadTime', event.target.value)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {errors.variants && <span className='error'>{errors.variants}</span>}
                </div>
              )}
              {!variants.length && <p className='muted'>Chọn thuộc tính để tạo bảng biến thể.</p>}
            </div>

            <div className='card'>
              <h2>Bulk pricing / MOQ</h2>
              {bulkPricing.map(tier => (
                <div key={tier.id} className='field-row tier-row'>
                  <label>
                    Min qty
                    <input type='number' min={0} value={tier.min_qty} onChange={event => updateBulkTier(tier.id, 'min_qty', event.target.value)} />
                  </label>
                  <label>
                    Giá/đơn vị
                    <input type='number' min={0} value={tier.price_per_unit} onChange={event => updateBulkTier(tier.id, 'price_per_unit', event.target.value)} />
                  </label>
                  <button type='button' className='ghost' onClick={() => removeBulkTier(tier.id)}>
                    Xóa
                  </button>
                </div>
              ))}
              <button type='button' className='secondary' onClick={addBulkTier}>
                + Thêm tier
              </button>
            </div>
          </div>
        )}

        {renderTabPanel(
          'shipping',
          <div className='card-grid'>
            <div className='card'>
              <h2>Đóng gói</h2>
              <div className='dimension-grid'>
                <label>
                  Dài (cm)
                  <input type='number' value={formState.shipping.packedLength} onChange={event => handleFieldChange('shipping.packedLength', event.target.value)} />
                </label>
                <label>
                  Rộng (cm)
                  <input type='number' value={formState.shipping.packedWidth} onChange={event => handleFieldChange('shipping.packedWidth', event.target.value)} />
                </label>
                <label>
                  Cao (cm)
                  <input type='number' value={formState.shipping.packedHeight} onChange={event => handleFieldChange('shipping.packedHeight', event.target.value)} />
                </label>
                <label>
                  Khối lượng đóng gói (kg)
                  <input type='number' value={formState.shipping.packedWeight} onChange={event => handleFieldChange('shipping.packedWeight', event.target.value)} />
                </label>
              </div>
              <label className='checkbox-inline'>
                <input
                  type='checkbox'
                  checked={formState.shipping.requiresCrate}
                  onChange={event => handleFieldChange('shipping.requiresCrate', event.target.checked)}
                />
                Cần đóng thùng gỗ / crate
              </label>
              {formState.shipping.requiresCrate && (
                <label>
                  Phí đóng crate (₫)
                  <input type='number' value={formState.shipping.crateFee} onChange={event => handleFieldChange('shipping.crateFee', event.target.value)} />
                </label>
              )}
              <div className='field-row checkbox-row'>
                <label>
                  <input type='checkbox' checked={formState.shipping.palletized} onChange={event => handleFieldChange('shipping.palletized', event.target.checked)} />
                  Palletized required
                </label>
                <label>
                  <input type='checkbox' checked={formState.shipping.forklift} onChange={event => handleFieldChange('shipping.forklift', event.target.checked)} />
                  Forklift required
                </label>
              </div>
            </div>

            <div className='card'>
              <h2>Phương thức vận chuyển</h2>
              <label className='checkbox-inline'>
                <input type='checkbox' checked={formState.shipping.localShipping} onChange={event => handleFieldChange('shipping.localShipping', event.target.checked)} />
                Local shipping
              </label>
              <label className='checkbox-inline'>
                <input type='checkbox' checked={formState.shipping.palletShipping} onChange={event => handleFieldChange('shipping.palletShipping', event.target.checked)} />
                Pallet shipping
              </label>
              <label className='checkbox-inline'>
                <input type='checkbox' checked={formState.shipping.freightShipping} onChange={event => handleFieldChange('shipping.freightShipping', event.target.checked)} />
                LTL / FTL
              </label>
              <label>
                Phí vận chuyển tham khảo / ghi chú
                <input
                  type='text'
                  value={formState.shipping.referenceFee}
                  onChange={event => handleFieldChange('shipping.referenceFee', event.target.value)}
                  placeholder='VD: 500.000đ nội thành HCM'
                />
              </label>
              <label>
                Ghi chú trọng yếu khi vận chuyển
                <textarea value={formState.shipping.criticalNotes} onChange={event => handleFieldChange('shipping.criticalNotes', event.target.value)}></textarea>
              </label>
              <label>
                Handling notes
                <textarea value={formState.shipping.handlingNotes} onChange={event => handleFieldChange('shipping.handlingNotes', event.target.value)}></textarea>
              </label>
            </div>
          </div>
        )}

        {renderTabPanel(
          'misc',
          <div className='card-grid'>
            <div className='card'>
              <h2>Thông tin khác</h2>
              <label>
                Condition
                <select value={formState.other.condition} onChange={event => handleFieldChange('other.condition', event.target.value as OtherInfo['condition'])}>
                  <option value='new'>Mới</option>
                  <option value='refurbished'>Tân trang</option>
                  <option value='second-hand'>Second-hand</option>
                </select>
              </label>
              <label>
                SKU chung
                <input type='text' value={formState.other.globalSku} onChange={event => handleFieldChange('other.globalSku', event.target.value)} />
              </label>
              <label>
                Tags / Keywords
                <input
                  type='text'
                  placeholder='Nhập từ khóa và Enter'
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      const target = event.target as HTMLInputElement
                      addTag(target.value)
                      target.value = ''
                    }
                  }}
                />
              </label>
              <div className='tag-list'>
                {formState.other.tags.map(tag => (
                  <span key={tag} className='tag'>
                    {tag}
                    <button type='button' aria-label={`Xóa tag ${tag}`} onClick={() => removeTag(tag)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <label className={`checkbox-inline ${errors.legal ? 'invalid' : ''}`}>
                <input
                  type='checkbox'
                  checked={formState.other.legalCompliance}
                  onChange={event => handleFieldChange('other.legalCompliance', event.target.checked)}
                />
                Sản phẩm tuân thủ quy định khai thác/đánh dấu nguồn gốc
              </label>
              {errors.legal && <span className='error'>{errors.legal}</span>}
            </div>
          </div>
        )}
      </form>

      {showExportModal && (
        <div className='modal' role='dialog' aria-modal='true'>
          <div className='modal__content'>
            <h2>JSON Schema</h2>
            <pre>{JSON.stringify(JSON_SCHEMA, null, 2)}</pre>
            <h3>Sample JSON</h3>
            <pre>{exportJson}</pre>
            <div className='actions'>
              <button type='button' className='ghost' onClick={() => setShowExportModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className='modal' role='dialog' aria-modal='true'>
          <div className='modal__content'>
            <h2>Xóa thay đổi?</h2>
            <p>Bạn có thay đổi chưa lưu. Tiếp tục sẽ mất dữ liệu vừa nhập.</p>
            <div className='actions'>
              <button type='button' className='ghost' onClick={() => setShowCancelModal(false)}>
                Quay lại
              </button>
              <button type='button' className='danger' onClick={confirmDiscard}>
                Hủy bỏ thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
