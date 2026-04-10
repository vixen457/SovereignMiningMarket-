import { NextResponse } from 'next/server'
import Pusher from 'pusher'
import { supabaseAdmin } from '@/lib/supabase'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,x-user-id,x-is-admin' }

const pusher = new Pusher({ appId: process.env.PUSHER_APP_ID!, key: process.env.PUSHER_KEY!, secret: process.env.PUSHER_SECRET!, cluster: process.env.PUSHER_CLUSTER!, useTLS: true })

export async function OPTIONS() { return NextResponse.json({}, { headers: cors }) }

export async function POST(req: Request) {
  const senderId = req.headers.get('x-user-id')
  if (!senderId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
  const { message, receiverId } = await req.json()
  const { data } = await supabaseAdmin.from('chat_messages').insert({ sender_id: senderId, receiver_id: receiverId, message, is_read: false }).select().single()
  await pusher.trigger(`chat-${receiverId}`, 'new-message', { id: data.id, sender_id: senderId, receiver_id: receiverId, message, created_at: data.created_at })
  await pusher.trigger(`chat-${senderId}`, 'new-message', { id: data.id, sender_id: senderId, receiver_id: receiverId, message, created_at: data.created_at })
  return NextResponse.json({ success: true }, { headers: cors })
}
