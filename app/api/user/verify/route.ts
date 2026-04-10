import { NextResponse } from 'next/server'
import { getUserByEmail, verifyPassword } from '@/lib/authHelpers'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }

export async function OPTIONS() { return NextResponse.json({}, { headers: cors }) }

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const user = await getUserByEmail(email)
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: cors })
  const valid = await verifyPassword(password, user.password)
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: cors })
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin, balance: user.balance, referral_code: user.referral_code, created_at: user.created_at } }, { headers: cors })
}
