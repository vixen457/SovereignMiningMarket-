import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId, amount, action, note } = await req.json()

  if (action === 'set') {
    await supabaseAdmin
      .from('users')
      .update({ balance: amount })
      .eq('id', userId)
  } else if (action === 'boost') {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single()

    await supabaseAdmin
      .from('users')
      .update({ balance: user.balance + amount })
      .eq('id', userId)
  }

  await supabaseAdmin.from('admin_actions').insert({
    admin_id: session.user.id,
    user_id: userId,
    action,
    amount,
    note,
  })

  return NextResponse.json({ success: true })
}
