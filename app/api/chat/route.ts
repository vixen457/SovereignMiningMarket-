import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  const isAdmin = session.user.isAdmin
  const currentUserId = session.user.id

  let query = supabaseAdmin
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: true })

  if (isAdmin && userId) {
    query = query.or(
      `and(sender_id.eq.${userId},receiver_id.eq.${currentUserId}),and(sender_id.eq.${currentUserId},receiver_id.eq.${userId})`
    )
  } else {
    query = query.or(
      `and(sender_id.eq.${currentUserId}),and(receiver_id.eq.${currentUserId})`
    )
  }

  const { data, error } = await query
  if (error) throw error

  return NextResponse.json({ messages: data })
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { message, receiverId } = await req.json()

  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .insert({
      sender_id: session.user.id,
      receiver_id: receiverId,
      message,
      is_read: false,
    })
    .select()
    .single()

  if (error) throw error

  return NextResponse.json({ success: true, data })
}
