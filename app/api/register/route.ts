import { NextResponse } from 'next/server'
import { hashPassword, generateReferralCode, getUserByEmail } from '@/lib/authHelpers'
import { supabaseAdmin } from '@/lib/supabase'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }

export async function OPTIONS() { return NextResponse.json({}, { headers: cors }) }

export async function POST(req: Request) {
  try {
    const { name, email, password, referralCode } = await req.json()
    if (!name || !email || !password) return NextResponse.json({ error: 'All fields required' }, { status: 400, headers: cors })
    const existing = await getUserByEmail(email)
    if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 400, headers: cors })
    const hashedPassword = await hashPassword(password)
    const newReferralCode = generateReferralCode(name)
    let referredBy = null
    if (referralCode) {
      const { data: referrer } = await supabaseAdmin.from('users').select('id').eq('referral_code', referralCode).single()
      if (referrer) referredBy = referrer.id
    }
    const { data: user, error } = await supabaseAdmin.from('users').insert({ name, email, password: hashedPassword, balance: 0.00, referral_code: newReferralCode, referred_by: referredBy, is_admin: false }).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, user }, { headers: cors })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500, headers: cors })
  }
}
