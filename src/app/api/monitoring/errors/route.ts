import { NextRequest, NextResponse } from 'next/server'
import { getFirestore } from 'firebase-admin/firestore'
import adminApp from '@/lib/firebase-admin'

const db = getFirestore(adminApp)

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json()
    
    // Validate error data
    if (!errorData.message || !errorData.timestamp) {
      return NextResponse.json(
        { error: 'Invalid error data' },
        { status: 400 }
      )
    }

    // Store error in Firestore (optional - for production error tracking)
    if (process.env.NODE_ENV === 'production') {
      await db.collection('errors').add({
        ...errorData,
        createdAt: new Date(),
        serverTimestamp: Date.now()
      })
    }

    // Log error to console for development
    if (process.env.NODE_ENV === 'development') {
      console.error('Client Error:', errorData)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging endpoint failed:', error)
    return NextResponse.json(
      { error: 'Failed to log error' },
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
    const limit = parseInt(searchParams.get('limit') || '50')
    const severity = searchParams.get('severity')
    const category = searchParams.get('category')

    let query = db.collection('errors').orderBy('createdAt', 'desc').limit(limit)

    if (severity) {
      query = query.where('severity', '==', severity) as any
    }

    if (category) {
      query = query.where('category', '==', category) as any
    }

    const snapshot = await query.get()
    const errors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({ errors })
  } catch (error) {
    console.error('Error fetching errors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch errors' },
      { status: 500 }
    )
  }
}