import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
export async function GET(req: Request) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await supabaseAdmin.from('users').select('id,name,email,balance,referral_code,created_at').eq('id', userId).single()
  return NextResponse.json({ user: data })
}
