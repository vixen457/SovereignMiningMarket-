import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,x-user-id,x-is-admin' }

export async function OPTIONS() { return NextResponse.json({}, { headers: cors }) }

export async function GET() {
  const { data } = await supabaseAdmin.from('users').select('id,name,email,balance,is_online,created_at,referral_code').eq('is_admin', false).order('created_at', { ascending: false })
  return NextResponse.json({ users: data || [] }, { headers: cors })
}
