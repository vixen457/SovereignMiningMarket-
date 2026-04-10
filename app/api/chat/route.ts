import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,x-user-id,x-is-admin' }

export async function OPTIONS() { return NextResponse.json({}, { headers: cors }) }

export async function GET(req: Request) {
  const userId = req.headers.get('x-user-id')
  const isAdmin = req.headers.get('x-is-admin')
  const { searchParams } = new URL(req.url)
  const targetId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
  let query = supabaseAdmin.from('chat_messages').select('*').order('created_at', { ascending: true })
  if (isAdmin && targetId) {
    query = query.or(`and(sender_id.eq.${targetId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${targetId})`)
  } else {
    query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
  }
  const { data } = await query
  return NextResponse.json({ messages: data || [] }, { headers: cors })
}
