import { supabase, getUserId } from './supabase'

const LEGACY_DEFAULTS = { business_name: 'Lash Finance', business_handle: 'CharmMeUp' }

export async function fetchProfile() {
  if (!supabase) return null
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    businessName: data.business_name || '',
    businessHandle: data.business_handle || '',
  }
}

async function hasExistingData(userId) {
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  return (count || 0) > 0
}

export async function ensureProfile(user) {
  if (!supabase || !user) return null

  const existing = await fetchProfile().catch(() => null)
  if (existing) return existing

  const meta = user.user_metadata || {}
  let businessName = meta.business_name || ''
  let businessHandle = (meta.business_handle || '').replace(/^@/, '')

  // Existing accounts with imported data keep Lash Finance / CharmMeUp
  if (!businessName) {
    const legacy = await hasExistingData(user.id)
    if (legacy) {
      businessName = LEGACY_DEFAULTS.business_name
      businessHandle = LEGACY_DEFAULTS.business_handle
    }
  }

  if (!businessName) {
    businessName = 'My Business'
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: user.id,
      business_name: businessName,
      business_handle: businessHandle,
    })
    .select()
    .single()

  if (error) throw error

  return {
    businessName: data.business_name,
    businessHandle: data.business_handle,
  }
}

export async function updateProfile(updates) {
  if (!supabase) return null
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('profiles')
    .update({
      business_name: updates.businessName,
      business_handle: (updates.businessHandle || '').replace(/^@/, ''),
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return {
    businessName: data.business_name,
    businessHandle: data.business_handle,
  }
}
