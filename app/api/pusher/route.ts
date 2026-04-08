import { NextResponse } from 'next/server'
import Pusher from 'pusher'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { message, receiverId } = await req.json()
  const senderId = session.user.id

  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      message,
      is_read: false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }

  await pusher.trigger(`chat-${receiverId}`, 'new-message', {
    id: data.id,
    sender_id: senderId,
    receiver_id: receiverId,
    message,
    created_at: data.created_at,
  })

  await pusher.trigger(`chat-${senderId}`, 'new-message', {
    id: data.id,
    sender_id: senderId,
    receiver_id: receiverId,
    message,
    created_at: data.created_at,
  })

  return NextResponse.json({ success: true, data })
}
