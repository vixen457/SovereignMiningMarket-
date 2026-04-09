import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { supabaseAdmin } from '@/lib/supabase'
export async function POST(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, amount, action, note } = await req.json()
  if (action === 'set') {
    await supabaseAdmin.from('users').update({ balance: amount }).eq('id', userId)
  } else {
    const { data: user } = await supabaseAdmin.from('users').select('balance').eq('id', userId).single()
    await supabaseAdmin.from('users').update({ balance: user.balance + amount }).eq('id', userId)
  }
  await supabaseAdmin.from('admin_actions').insert({ admin_id: token.id, user_id: userId, action, amount, note })
  return NextResponse.json({ success: true })
}
