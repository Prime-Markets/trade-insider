// app/api/track-search/route.ts
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Check if user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If user is authenticated, don't track free searches
    if (user) {
      return NextResponse.json({ success: true, authenticated: true })
    }

    // Get current search count from cookies
    const cookieStore = await cookies()
    const currentCount = parseInt(cookieStore.get('free_searches')?.value || '0')
    const newCount = currentCount + 1

    // Create response
    const response = NextResponse.json({ 
      success: true, 
      searchCount: newCount,
      remainingSearches: Math.max(0, 10 - newCount)
    })

    // Set updated cookie
    response.cookies.set('free_searches', newCount.toString(), {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return response
  } catch (error) {
    console.error('Error tracking search:', error)
    return NextResponse.json({ error: 'Failed to track search' }, { status: 500 })
  }
}