'use client'

import { useState, useEffect } from 'react'
import { performanceMonitor } from '@/lib/performanceMonitor'
import { errorTracker } from '@/lib/errorTracking'
import { userBehaviorAnalytics } from '@/lib/userBehaviorAnalytics'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface MonitoringDashboardProps {
  isVisible: boolean
  onClose: () => void
}

export function MonitoringDashboard({ isVisible, onClose }: MonitoringDashboardProps) {
  const [activeTab, setActiveTab] = useState<'performance' | 'errors' | 'analytics'>('performance')
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([])
  const [errorStats, setErrorStats] = useState<any>({})
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  useEffect(() => {
    if (isVisible) {
      updateData()
      const interval = setInterval(updateData, 5000) // Update every 5 seconds
      return () => clearInterval(interval)
    }
  }, [isVisible])

  const updateData = () => {
    setPerformanceMetrics(performanceMonitor.getMetrics())
    setErrorStats(errorTracker.getErrorStats())
    setSessionInfo(userBehaviorAnalytics.getCurrentSession())
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Monitoring Dashboard</h2>
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        </div>

        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'performance'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'errors'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('errors')}
          >
            Errors
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'analytics'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeTab === 'performance' && (
            <PerformanceTab metrics={performanceMetrics} />
          )}
          {activeTab === 'errors' && (
            <ErrorsTab stats={errorStats} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab sessionInfo={sessionInfo} />
          )}
        </div>
      </div>
    </div>
  )
}

function PerformanceTab({ metrics }: { metrics: unknown[] }) {
  const coreWebVitals = metrics.filter(m => ['LCP', 'FID', 'CLS'].includes(m.name))
  const apiMetrics = metrics.filter(m => m.name.startsWith('API_'))
  const otherMetrics = metrics.filter(m => !['LCP', 'FID', 'CLS'].includes(m.name) && !m.name.startsWith('API_'))

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Core Web Vitals</h3>
        <div className="grid grid-cols-3 gap-4">
          {coreWebVitals.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metric.value.toFixed(2)}
                {metric.name === 'CLS' ? '' : 'ms'}
              </div>
              <div className="text-sm text-gray-600">{metric.name}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">API Performance</h3>
        <div className="space-y-2">
          {apiMetrics.slice(-5).map((metric, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm">{metric.name}</span>
              <span className="font-mono text-sm">{metric.value.toFixed(2)}ms</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Other Metrics</h3>
        <div className="space-y-2">
          {otherMetrics.slice(-10).map((metric, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm">{metric.name}</span>
              <span className="font-mono text-sm">{metric.value.toFixed(2)}ms</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function ErrorsTab({ stats }: { stats: unknown }) {
  const errors = errorTracker.getErrors()

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Error Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.total || 0}</div>
            <div className="text-sm text-gray-600">Total Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.by_severity?.high || 0}
            </div>
            <div className="text-sm text-gray-600">High Severity</div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Error Breakdown</h3>
        <div className="space-y-2">
          {Object.entries(stats.by_category || {}).map(([category, count]) => (
            <div key={category} className="flex justify-between items-center">
              <span className="text-sm capitalize">{category}</span>
              <span className="font-mono text-sm">{count as number}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Recent Errors</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {errors.slice(-5).map((error, index) => (
            <div key={index} className="text-xs border-l-2 border-red-300 pl-2">
              <div className="font-medium">{error.message}</div>
              <div className="text-gray-500">
                {error.category} • {error.severity} • {new Date(error.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function AnalyticsTab({ sessionInfo }: { sessionInfo: unknown }) {
  if (!sessionInfo) {
    return (
      <Card className="p-4">
        <p className="text-gray-600">No active session</p>
      </Card>
    )
  }

  const sessionDuration = Date.now() - sessionInfo.startTime
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Current Session</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Session Duration</div>
            <div className="font-mono">{formatDuration(sessionDuration)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Page Views</div>
            <div className="font-mono">{sessionInfo.pageViews.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Actions</div>
            <div className="font-mono">{sessionInfo.actions.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Device</div>
            <div className="text-sm">
              {sessionInfo.deviceInfo.isMobile ? 'Mobile' : 
               sessionInfo.deviceInfo.isTablet ? 'Tablet' : 'Desktop'}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Recent Actions</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {sessionInfo.actions.slice(-10).map((action: unknown, index: number) => (
            <div key={index} className="text-xs border-l-2 border-blue-300 pl-2">
              <div className="font-medium">{action.type}</div>
              <div className="text-gray-500">
                {new Date(action.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Page Views</h3>
        <div className="space-y-1">
          {sessionInfo.pageViews.map((page: string, index: number) => (
            <div key={index} className="text-sm text-gray-600">
              {index + 1}. {page}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// Development-only monitoring toggle
export function MonitoringToggle() {
  const [isVisible, setIsVisible] = useState(false)

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <>
      <button
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 z-40"
        onClick={() => setIsVisible(true)}
        title="Open Monitoring Dashboard"
      >
        📊
      </button>
      <MonitoringDashboard
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
      />
    </>
  )
}