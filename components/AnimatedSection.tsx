'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  animation?: 'fadeUp' | 'fadeIn' | 'scale' | 'slideIn'
  delay?: number
}

export default function AnimatedSection({ 
  children, 
  className = '', 
  animation = 'fadeUp',
  delay = 0 
}: AnimatedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const animations = {
      fadeUp: {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      },
      fadeIn: {
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
      },
      scale: {
        scale: 0.95,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
      },
      slideIn: {
        x: -50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      }
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    })

    tl.to(section, {
      ...animations[animation],
      delay,
      clearProps: 'all'
    })
  }, [animation, delay])

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  )
} 