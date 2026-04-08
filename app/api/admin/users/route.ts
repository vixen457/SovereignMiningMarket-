import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, name, email, balance, is_online, last_seen, created_at, referral_code')
    .eq('is_admin', false)
    .order('created_at', { ascending: false })

  if (error) throw error

  return NextResponse.json({ users: data })
}
