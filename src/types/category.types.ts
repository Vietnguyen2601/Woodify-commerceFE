export interface CategoryDTO {
  categoryId: string
  parentCategoryId: string | null
  parentCategoryName: string | null
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  isActive: boolean
  subCategoriesCount: number
}

export interface CreateCategoryRequest {
  parentCategoryId?: string | null
  name: string
  description?: string
  isActive: boolean
}

export interface CreateCategoryApiResponse {
  status: number
  message: string
  data: CategoryDTO
  errors: unknown
}

export interface CategoryListApiResponse {
  status: number
  message: string
  data: CategoryDTO[]
  errors: unknown
}

export interface CategorySearchApiResponse {
  status: number
  message: string
  data: CategoryDTO | CategoryDTO[] | null
  errors: unknown
}
