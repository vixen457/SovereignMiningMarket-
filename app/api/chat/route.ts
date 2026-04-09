import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { supabaseAdmin } from '@/lib/supabase'
export async function GET(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const id = token.id as string
  let query = supabaseAdmin.from('chat_messages').select('*').order('created_at', { ascending: true })
  if (token.isAdmin && userId) {
    query = query.or(`and(sender_id.eq.${userId},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${userId})`)
  } else {
    query = query.or(`sender_id.eq.${id},receiver_id.eq.${id}`)
  }
  const { data } = await query
  return NextResponse.json({ messages: data })
}
export async function POST(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { message, receiverId } = await req.json()
  const { data } = await supabaseAdmin.from('chat_messages').insert({ sender_id: token.id, receiver_id: receiverId, message, is_read: false }).select().single()
  return NextResponse.json({ success: true, data })
}
