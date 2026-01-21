import React from 'react'
import { Link } from 'react-router-dom'
import './HeroSection.css'

interface HeroSectionProps {
  activeSlide?: number
  totalSlides?: number
  onSlideChange?: (index: number) => void
}

export default function HeroSection({ 
  activeSlide = 0, 
  totalSlides = 5,
  onSlideChange 
}: HeroSectionProps) {
  return (
    <section className="hero">
      <img 
        className="hero__image"
        src="https://api.builder.io/api/v1/image/assets/TEMP/f82779e269fd43005091ca94ff7a635eded6adfc?width=2542" 
        alt="Woodify Hero - Nội thất gỗ Việt Nam" 
      />
      
      <div className="hero__content">
        <div className="hero__box">
          <h1 className="hero__title">
            Where enduring quality meets modern design
          </h1>
          <p className="hero__subtitle">
            Explore the endless beauty of Vietnamese wood
          </p>
        </div>
        
        <Link to="/catalog" className="hero__cta">
          Discover now
        </Link>
      </div>

      <div className="hero__indicators">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            className={`hero__indicator ${index === activeSlide ? 'hero__indicator--active' : ''}`}
            onClick={() => onSlideChange?.(index)}
            aria-label={`Go to slide ${index + 1}`}
          >
            <span className="hero__indicator-fill" />
          </button>
        ))}
      </div>
    </section>
  )
}
