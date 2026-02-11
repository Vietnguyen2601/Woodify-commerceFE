import React from 'react'

type ProductCard = {
  id: string
  title: string
  category: string
  version: string
  price: string
  stock: string
  stockTone: 'default' | 'warning' | 'critical'
  rating: string
  status: 'Published' | 'Draft'
  image: string
}

const PRODUCTS: ProductCard[] = [
  {
    id: 'oak',
    title: 'Oak Dining Table',
    category: 'Tables',
    version: 'v2.1',
    price: '12.500.000 ₫',
    stock: '15 units',
    stockTone: 'default',
    rating: '4.8',
    status: 'Published',
    image: 'https://placehold.co/423x156'
  },
  {
    id: 'walnut',
    title: 'Walnut Bookshelf',
    category: 'Storage',
    version: 'v1.3',
    price: '8.900.000 ₫',
    stock: '22 units',
    stockTone: 'default',
    rating: '4.9',
    status: 'Published',
    image: 'https://placehold.co/423x156'
  },
  {
    id: 'pine',
    title: 'Pine Coffee Table',
    category: 'Tables',
    version: 'v1.0',
    price: '3.500.000 ₫',
    stock: '8 units',
    stockTone: 'warning',
    rating: '4.5',
    status: 'Published',
    image: 'https://placehold.co/423x156'
  },
  {
    id: 'teak',
    title: 'Teak Chair Set',
    category: 'Seating',
    version: 'v3.0',
    price: '15.600.000 ₫',
    stock: '12 units',
    stockTone: 'default',
    rating: '4.7',
    status: 'Published',
    image: 'https://placehold.co/423x156'
  },
  {
    id: 'mahogany',
    title: 'Mahogany Desk',
    category: 'Desks',
    version: 'v1.0',
    price: '24.900.000 ₫',
    stock: '0 units',
    stockTone: 'critical',
    rating: '4.6',
    status: 'Draft',
    image: 'https://placehold.co/423x156'
  }
]

const statusClasses: Record<ProductCard['status'], string> = {
  Published: 'bg-yellow-800 text-white',
  Draft: 'bg-orange-100 text-stone-900'
}

const stockToneClasses: Record<ProductCard['stockTone'], string> = {
  default: 'text-stone-900',
  warning: 'text-rose-600',
  critical: 'text-rose-600'
}

export default function ProductList() {
  return (
    <div className='min-h-screen bg-stone-100 font-["Arimo"] text-stone-900'>
      <div className='mx-auto max-w-6xl px-4 py-10'>
        <div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <p className='text-2xl font-bold leading-7'>Products Management</p>
            <p className='text-xs text-stone-600'>Manage your product catalog and inventory</p>
          </div>
          <button
            type='button'
            className='inline-flex items-center gap-2 rounded bg-yellow-800 px-5 py-2 text-xs font-medium text-white shadow-[0px_1px_3px_rgba(0,0,0,0.20)]'
          >
            <span className='h-3 w-3 border border-white' aria-hidden />
            Create Product
          </button>
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
              {PRODUCTS.map(product => (
                <article
                  key={product.id}
                  className='overflow-hidden rounded-xl border border-yellow-800/20 bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.10)]'
                >
                  <div className='relative h-40 w-full bg-orange-100'>
                    <img
                      src={product.image}
                      alt={product.title}
                      className='h-full w-full object-cover'
                    />
                    <span
                      className={`absolute right-4 top-3 rounded px-3 py-1 text-[9.75px] ${statusClasses[product.status]}`}
                    >
                      {product.status}
                    </span>
                  </div>
                  <div className='space-y-5 px-5 pb-6 pt-5'>
                    <div>
                      <p className='text-sm font-medium'>{product.title}</p>
                      <div className='mt-1 flex items-center justify-between text-xs text-stone-600'>
                        <span>{product.category}</span>
                        <span className='rounded border border-yellow-800/20 px-2 py-0.5 text-[9.75px] text-stone-900'>{product.version}</span>
                      </div>
                    </div>

                    <div className='flex items-center justify-between text-xs'>
                      <div>
                        <p className='text-stone-600'>Price</p>
                        <p className='font-bold text-stone-900'>{product.price}</p>
                      </div>
                      <div className='text-right'>
                        <p className='text-stone-600'>Stock</p>
                        <p className={`font-bold ${stockToneClasses[product.stockTone]}`}>{product.stock}</p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2 text-xs text-stone-600'>
                      <span className='inline-flex items-center gap-1 font-medium text-stone-900'>
                        <span aria-hidden className='h-4 w-4 rounded bg-yellow-400' />
                        {product.rating}
                      </span>
                      Average Rating
                    </div>

                    <div className='flex items-center gap-2'>
                      <button
                        type='button'
                        className='flex-1 rounded border border-yellow-800/20 bg-stone-100 px-3 py-2 text-center text-xs text-stone-900'
                      >
                        Edit
                      </button>
                      <button
                        type='button'
                        className='flex-1 rounded bg-yellow-800 px-3 py-2 text-center text-xs text-white'
                      >
                        Versions
                      </button>
                      <button
                        type='button'
                        className='flex h-8 w-8 items-center justify-center rounded text-stone-900'
                        aria-label='More actions'
                      >
                        <span className='text-lg'>⋯</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
        </div>

        <div className='mt-6 rounded-xl border border-yellow-800/20 bg-orange-100/40 px-5 py-3 text-xs text-stone-600 shadow-[0px_1px_3px_rgba(0,0,0,0.10)]'>
          <span className='font-semibold text-stone-700'>Product Versions:</span> Each product can have multiple versions with different specifications.
          Versions are locked once they have sales to maintain order history integrity.
        </div>
      </div>
    </div>
  )
}
