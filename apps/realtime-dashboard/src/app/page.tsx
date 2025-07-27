'use client'

import { useState, useEffect } from 'react'

interface DataPoint {
  id: string
  value: number
  label: string
  timestamp: Date
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
  }[]
}

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isOnline, setIsOnline] = useState(true)
  const [activeUsers, setActiveUsers] = useState(1247)
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [{
      label: 'Real-time Data',
      data: [],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)'
    }]
  })

  // Simulate real-time data updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      
      // Simulate active users fluctuation
      setActiveUsers(prev => prev + Math.floor(Math.random() * 10) - 5)
      
      // Add new data point
      const newDataPoint: DataPoint = {
        id: Date.now().toString(),
        value: Math.floor(Math.random() * 100),
        label: `Data Point ${dataPoints.length + 1}`,
        timestamp: new Date()
      }
      
      setDataPoints(prev => {
        const updated = [...prev, newDataPoint]
        // Keep only last 20 data points
        return updated.slice(-20)
      })
      
      // Update chart data
      setChartData(prev => ({
        labels: [...prev.labels, newDataPoint.timestamp.toLocaleTimeString()].slice(-20),
        datasets: [{
          ...prev.datasets[0],
          data: [...prev.datasets[0].data, newDataPoint.value].slice(-20)
        }]
      }))
    }, 2000)

    return () => clearInterval(timer)
  }, [dataPoints.length])

  // Simulate connection status
  useEffect(() => {
    const connectionTimer = setInterval(() => {
      setIsOnline(Math.random() > 0.1) // 90% uptime
    }, 10000)

    return () => clearInterval(connectionTimer)
  }, [])

  const metrics = [
    {
      title: 'Active Users',
      value: activeUsers.toLocaleString(),
      change: '+12%',
      positive: true,
      icon: '👥'
    },
    {
      title: 'Response Time',
      value: '45ms',
      change: '-8%',
      positive: true,
      icon: '⚡'
    },
    {
      title: 'Error Rate',
      value: '0.2%',
      change: '-15%',
      positive: true,
      icon: '✅'
    },
    {
      title: 'Throughput',
      value: '2.4k req/s',
      change: '+5%',
      positive: true,
      icon: '📊'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Real-time Dashboard</h1>
              <p className="text-gray-300">Live data visualization and monitoring</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className={`text-sm ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="text-white text-sm">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">{metric.icon}</div>
                <span className={`text-sm font-semibold ${metric.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {metric.change}
                </span>
              </div>
              <h3 className="text-gray-300 text-sm mb-1">{metric.title}</h3>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Real-time Chart */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Real-time Data Stream</h3>
            <div className="h-64 bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-300 text-sm">Live Data Points</span>
                <span className="text-white font-semibold">{dataPoints.length}</span>
              </div>
              <div className="space-y-2">
                {dataPoints.slice(-5).map((point) => (
                  <div key={point.id} className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">{point.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                          style={{ width: `${point.value}%` }}
                        ></div>
                      </div>
                      <span className="text-white text-sm font-semibold">{point.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">System Status</h3>
            <div className="space-y-4">
              {[
                { service: 'API Gateway', status: 'healthy', uptime: '99.9%' },
                { service: 'Database', status: 'healthy', uptime: '99.8%' },
                { service: 'Cache Layer', status: 'healthy', uptime: '99.7%' },
                { service: 'File Storage', status: 'healthy', uptime: '99.9%' }
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-white font-medium">{service.service}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 text-sm font-semibold">{service.status}</div>
                    <div className="text-gray-400 text-xs">{service.uptime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: 'User login', user: 'john.doe@example.com', time: '2 minutes ago' },
              { action: 'Data export', user: 'admin@company.com', time: '5 minutes ago' },
              { action: 'API request', user: 'mobile-app', time: '8 minutes ago' },
              { action: 'System backup', user: 'automated', time: '15 minutes ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="text-white font-medium">{activity.action}</div>
                    <div className="text-gray-400 text-sm">{activity.user}</div>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
