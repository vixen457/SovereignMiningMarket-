import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,x-user-id' }

export async function OPTIONS() { return NextResponse.json({}, { headers: cors }) }

export async function GET(req: Request) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
  const { data } = await supabaseAdmin.from('users').select('id,name,email,balance,deposit_balance,interest_balance,invest_balance,referral_code,created_at').eq('id', userId).single()
  return NextResponse.json({ user: data }, { headers: cors })
}
