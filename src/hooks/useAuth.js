import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { ensureProfile, fetchProfile } from '../lib/profile'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const loadProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null)
      return
    }
    try {
      let p = await fetchProfile().catch(() => null)
      if (!p) p = await ensureProfile(user)
      setProfile(p)
    } catch (err) {
      console.error('Profile load failed:', err)
      setProfile({ businessName: 'My Business', businessHandle: '' })
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) await loadProfile(s.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s)
      if (s?.user) await loadProfile(s.user)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  const signUp = async (email, password, { businessName, businessHandle }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          business_name: businessName.trim(),
          business_handle: businessHandle.trim().replace(/^@/, ''),
        },
      },
    })
    if (error) throw error

    // If email confirm is off, session exists — create profile now
    if (data.session?.user) {
      await ensureProfile(data.session.user)
    }

    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.user) await loadProfile(data.user)
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setProfile(null)
  }

  return {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: Boolean(session),
  }
}
