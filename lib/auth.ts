import bcrypt from 'bcryptjs'
import { supabaseAdmin } from './supabase'

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function generateReferralCode(name: string) {
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return name.slice(0, 3).toUpperCase() + random
}

export async function getUserByEmail(email: string) {
  const { data } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  return data
}

export async function getUserById(id: string) {
  const { data } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  return data
}
