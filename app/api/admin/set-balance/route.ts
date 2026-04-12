import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,x-user-id,x-is-admin' }

export async function OPTIONS() { return NextResponse.json({}, { headers: cors }) }

export async function POST(req: Request) {
  const adminId = req.headers.get('x-user-id')
  const isAdmin = req.headers.get('x-is-admin')
  if (!adminId || !isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
  const { userId, amount, action, note } = await req.json()

  const { data: user } = await supabaseAdmin.from('users').select('deposit_balance, interest_balance').eq('id', userId).single()

  if (action === 'set') {
    // Set = deposit balance
    const newDeposit = amount
    const total = newDeposit + (user?.interest_balance || 0)
    await supabaseAdmin.from('users').update({ deposit_balance: newDeposit, balance: total }).eq('id', userId)
  } else {
    // Boost = interest balance
    const newInterest = (user?.interest_balance || 0) + amount
    const total = (user?.deposit_balance || 0) + newInterest
    await supabaseAdmin.from('users').update({ interest_balance: newInterest, balance: total }).eq('id', userId)
  }

  await supabaseAdmin.from('admin_actions').insert({ admin_id: adminId, user_id: userId, action, amount, note: note || '' })
  return NextResponse.json({ success: true }, { headers: cors })
}
