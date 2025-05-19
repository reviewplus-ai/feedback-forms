'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface AnimatedGridProps {
  children: React.ReactNode
  className?: string
  stagger?: number
}

export default function AnimatedGrid({ 
  children, 
  className = '',
  stagger = 0.1
}: AnimatedGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const items = grid.children
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: grid,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    })

    gsap.set(items, { opacity: 0, y: 30 })

    tl.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger,
      ease: 'power3.out'
    })
  }, [stagger])

  return (
    <div ref={gridRef} className={className}>
      {children}
    </div>
  )
} 