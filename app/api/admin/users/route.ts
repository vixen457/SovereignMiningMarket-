import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { supabaseAdmin } from '@/lib/supabase'
export async function GET(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await supabaseAdmin.from('users').select('id, name, email, balance, is_online, last_seen, created_at, referral_code').eq('is_admin', false).order('created_at', { ascending: false })
  return NextResponse.json({ users: data })
}
