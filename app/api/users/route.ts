import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import { requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Only allow admin
    const authResult = requireRole(request, ['admin'])
    if (authResult instanceof NextResponse) return authResult

    await dbConnect()
    const users = await User.find({}, '_id name email phone role createdAt').sort({ createdAt: -1 }).lean()
    const total = await User.countDocuments()
    return NextResponse.json({ users, total })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
} 