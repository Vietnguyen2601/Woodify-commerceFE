import React from 'react'
import { Link } from 'react-router-dom'

const categoryList = [
  {
    id: 'living-room',
    name: 'Phòng khách',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M38 18V12C38 10.9391 37.5786 9.92172 36.8284 9.17157C36.0783 8.42143 35.0609 8 34 8H14C12.9391 8 11.9217 8.42143 11.1716 9.17157C10.4214 9.92172 10 10.9391 10 12V18" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 32C6 33.0609 6.42143 34.0783 7.17157 34.8284C7.92172 35.5786 8.93913 36 10 36H38C39.0609 36 40.0783 35.5786 40.8284 34.8284C41.5786 34.0783 42 33.0609 42 32V22C42 20.9391 41.5786 19.9217 40.8284 19.1716C40.0783 18.4214 39.0609 18 38 18C36.9391 18 35.9217 18.4214 35.1716 19.1716C34.4214 19.9217 34 20.9391 34 22V25C34 25.2652 33.8946 25.5196 33.7071 25.7071C33.5196 25.8946 33.2652 26 33 26H15C14.7348 26 14.4804 25.8946 14.2929 25.7071C14.1054 25.5196 14 25.2652 14 25V22C14 20.9391 13.5786 19.9217 12.8284 19.1716C12.0783 18.4214 11.0609 18 10 18C8.93913 18 7.92172 18.4214 7.17157 19.1716C6.42143 19.9217 6 20.9391 6 22V32Z" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 36V40" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M38 36V40" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    id: 'decor',
    name: 'Đồ trang trí',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M22.034 5.628C22.1197 5.1692 22.3631 4.75483 22.7222 4.45663C23.0812 4.15844 23.5333 3.99521 24 3.99521C24.4667 3.99521 24.9188 4.15844 25.2778 4.45663C25.6369 4.75483 25.8803 5.1692 25.966 5.628L28.068 16.744C28.2173 17.5343 28.6014 18.2612 29.1701 18.8299C29.7388 19.3986 30.4657 19.7827 31.256 19.932L42.372 22.034C42.8308 22.1197 43.2452 22.3631 43.5434 22.7222C43.8416 23.0812 44.0048 23.5333 44.0048 24C44.0048 24.4667 43.8416 24.9188 43.5434 25.2778C43.2452 25.6369 42.8308 25.8803 42.372 25.966L31.256 28.068C30.4657 28.2173 29.7388 28.6014 29.1701 29.1701C28.6014 29.7388 28.2173 30.4657 28.068 31.256L25.966 42.372C25.8803 42.8308 25.6369 43.2452 25.2778 43.5434C24.9188 43.8416 24.4667 44.0048 24 44.0048C23.5333 44.0048 23.0812 43.8416 22.7222 43.5434C22.3631 43.2452 22.1197 42.8308 22.034 42.372L19.932 31.256C19.7827 30.4657 19.3986 29.7388 18.8299 29.1701C18.2612 28.6014 17.5343 28.2173 16.744 28.068L5.628 25.966C5.1692 25.8803 4.75483 25.6369 4.45663 25.2778C4.15844 24.9188 3.99521 24.4667 3.99521 24C3.99521 23.5333 4.15844 23.0812 4.45663 22.7222C4.75483 22.3631 5.1692 22.1197 5.628 22.034L16.744 19.932C17.5343 19.7827 18.2612 19.3986 18.8299 18.8299C19.3986 18.2612 19.7827 17.5343 19.932 16.744L22.034 5.628Z" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M40 4V12" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M44 8H36" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 44C10.2091 44 12 42.2091 12 40C12 37.7909 10.2091 36 8 36C5.79086 36 4 37.7909 4 40C4 42.2091 5.79086 44 8 44Z" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    id: 'bedroom',
    name: 'Phòng ngủ',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M4 8V40" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 16H40C41.0609 16 42.0783 16.4214 42.8284 17.1716C43.5786 17.9217 44 18.9391 44 20V40" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 34H44" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 16V34" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    id: 'dining-room',
    name: 'Phòng ăn',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M8 16H40" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 16V38" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M36 16V38" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 24H40" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    id: 'office',
    name: 'Văn phòng',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M42 6H6C4.89543 6 4 6.89543 4 8V14C4 15.1046 4.89543 16 6 16H42C43.1046 16 44 15.1046 44 14V8C44 6.89543 43.1046 6 42 6Z" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 16V38C8 39.0609 8.42143 40.0783 9.17157 40.8284C9.92172 41.5786 10.9391 42 12 42H36C37.0609 42 38.0783 41.5786 38.8284 40.8284C39.5786 40.0783 40 39.0609 40 38V16" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 24H28" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    id: 'outdoor',
    name: 'Ngoài trời',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="7" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 6V10" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 38V42" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 24H10" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M38 24H42" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.3 11.3L14.1 14.1" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M33.9 33.9L36.7 36.7" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M33.9 14.1L36.7 11.3" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.3 36.7L14.1 33.9" stroke="#BE9C73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
]

export default function FeaturedCategories() {
  return (
    <section className="py-12 px-4 md:px-8 lg:px-16">
      <h2 className="font-['Inter'] text-[28px] font-extrabold text-black text-center mb-12">
        Danh mục nổi bật
      </h2>
      
      <div className="flex justify-center items-start gap-8 lg:gap-16 md:gap-10 sm:gap-8 flex-wrap">
        {categoryList.map((category) => (
          <Link 
            key={category.id}
            to={`/catalog?category=${category.id}`}
            className="flex flex-col items-center gap-4 no-underline group w-[120px] sm:w-[100px]"
          >
            <div className="relative w-[100px] h-[100px] sm:w-20 sm:h-20">
              <div className="absolute inset-0 rounded-full border-[3px] border-[#BE9C73] bg-transparent" />
              <div className="absolute -top-[3px] left-0 w-[100px] h-[100px] sm:w-20 sm:h-20 sm:-top-[2px] flex items-center justify-center rounded-full bg-white transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
                {category.icon}
              </div>
            </div>
            <span className="font-['Arimo'] text-sm font-normal text-black text-center leading-tight">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
