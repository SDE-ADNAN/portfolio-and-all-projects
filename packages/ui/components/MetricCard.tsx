import React from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  positive?: boolean
  icon?: string
  className?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  positive = true,
  icon,
  className = ''
}) => {
  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        {icon && <div className="text-3xl">{icon}</div>}
        {change && (
          <span className={`text-sm font-semibold ${positive ? 'text-green-400' : 'text-red-400'}`}>
            {change}
          </span>
        )}
      </div>
      <h3 className="text-gray-300 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
} 