import { NextResponse } from 'next/server'
import Pusher from 'pusher'
import { getToken } from 'next-auth/jwt'
import { supabaseAdmin } from '@/lib/supabase'
const pusher = new Pusher({ appId: process.env.PUSHER_APP_ID!, key: process.env.PUSHER_KEY!, secret: process.env.PUSHER_SECRET!, cluster: process.env.PUSHER_CLUSTER!, useTLS: true })
export async function POST(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { message, receiverId } = await req.json()
  const { data } = await supabaseAdmin.from('chat_messages').insert({ sender_id: token.id, receiver_id: receiverId, message, is_read: false }).select().single()
  await pusher.trigger(`chat-${receiverId}`, 'new-message', { id: data.id, sender_id: token.id, receiver_id: receiverId, message, created_at: data.created_at })
  await pusher.trigger(`chat-${token.id}`, 'new-message', { id: data.id, sender_id: token.id, receiver_id: receiverId, message, created_at: data.created_at })
  return NextResponse.json({ success: true })
}
