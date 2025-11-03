import { NextRequest, NextResponse } from 'next/server'
import { getFirestore } from 'firebase-admin/firestore'
import adminApp from '@/lib/firebase-admin'

const db = getFirestore(adminApp)

export async function POST(request: NextRequest) {
  try {
    const performanceData = await request.json()
    
    // Validate performance data
    if (!performanceData.metrics || !Array.isArray(performanceData.metrics)) {
      return NextResponse.json(
        { error: 'Invalid performance data' },
        { status: 400 }
      )
    }

    // Store performance metrics in Firestore (optional - for production monitoring)
    if (process.env.NODE_ENV === 'production') {
      const batch = db.batch()
      
      performanceData.metrics.forEach((metric: any) => {
        const docRef = db.collection('performance_metrics').doc()
        batch.set(docRef, {
          ...metric,
          createdAt: new Date(),
          serverTimestamp: Date.now(),
          userAgent: request.headers.get('user-agent') || 'unknown',
          ip: request.headers.get('x-forwarded-for') || 'unknown'
        })
      })

      await batch.commit()
    }

    // Log performance data in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metrics:', performanceData.metrics)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Performance logging endpoint failed:', error)
    return NextResponse.json(
      { error: 'Failed to log performance data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Not available in production' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const metricName = searchParams.get('metric')
    const timeRange = searchParams.get('timeRange') || '1h' // 1h, 24h, 7d

    let query = db.collection('performance_metrics')
      .orderBy('createdAt', 'desc')
      .limit(limit)

    if (metricName) {
      query = query.where('name', '==', metricName) as any
    }

    // Add time range filter
    const now = new Date()
    let startTime: Date
    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      default:
        startTime = new Date(now.getTime() - 60 * 60 * 1000)
    }

    query = query.where('createdAt', '>=', startTime) as any

    const snapshot = await query.get()
    const metrics = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Calculate aggregated statistics
    const stats = calculateMetricStats(metrics, metricName)

    return NextResponse.json({ 
      metrics,
      stats,
      timeRange,
      count: metrics.length
    })
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    )
  }
}

function calculateMetricStats(metrics: any[], metricName?: string) {
  if (metrics.length === 0) return null

  const values = metrics.map(m => m.value).filter(v => typeof v === 'number')
  
  if (values.length === 0) return null

  const sorted = values.sort((a, b) => a - b)
  const sum = values.reduce((acc, val) => acc + val, 0)
  
  return {
    count: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    avg: sum / values.length,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)]
  }
}