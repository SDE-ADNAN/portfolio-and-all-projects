import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'elevated'
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default'
}) => {
  const baseClasses = 'rounded-xl border transition-all duration-300'
  
  const variantClasses = {
    default: 'bg-white/10 backdrop-blur-sm border-white/20',
    glass: 'bg-white/5 backdrop-blur-md border-white/10',
    elevated: 'bg-white/15 backdrop-blur-sm border-white/30 shadow-lg'
  }
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  )
} 