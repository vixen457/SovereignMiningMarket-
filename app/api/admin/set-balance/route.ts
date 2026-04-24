import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,x-user-id,x-is-admin' }

export async function OPTIONS() { return NextResponse.json({}, { headers: cors }) }

export async function POST(req: Request) {
  const adminId = req.headers.get('x-user-id')
  const isAdmin = req.headers.get('x-is-admin')
  if (!adminId || !isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
  const { userId, amount, action, note } = await req.json()
  const { data: user } = await supabaseAdmin.from('users').select('deposit_balance,interest_balance,invest_balance').eq('id', userId).single()
  let updateData: any = {}
  if (action === 'set') {
    updateData = { deposit_balance: amount }
  } else if (action === 'boost') {
    updateData = { interest_balance: (user?.interest_balance || 0) + amount }
  } else if (action === 'invest') {
    updateData = { invest_balance: amount }
  } else if (action === 'set_interest') {
    updateData = { interest_balance: amount }
  }
  const dep = action === 'set' ? amount : (user?.deposit_balance || 0)
  const int = action === 'boost' ? (user?.interest_balance || 0) + amount : action === 'set_interest' ? amount : (user?.interest_balance || 0)
  updateData.balance = dep + int
  await supabaseAdmin.from('users').update(updateData).eq('id', userId)
  await supabaseAdmin.from('admin_actions').insert({ admin_id: adminId, user_id: userId, action, amount, note: note || '' })
  return NextResponse.json({ success: true }, { headers: cors })
}
