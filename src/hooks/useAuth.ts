'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }, [supabase])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) await fetchProfile(user.id)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        const msg = typeof error.message === 'string' && error.message.trim()
          ? error.message
          : 'Une erreur est survenue lors de la connexion.'
        return { error: { message: msg } }
      }
      return { error: null }
    } catch {
      return { error: { message: 'Une erreur est survenue lors de la connexion.' } }
    }
  }

  const checkUsernameAvailable = useCallback(async (username: string): Promise<boolean> => {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()
    return !data
  }, [supabase])

  const signUpWithEmail = async (email: string, password: string, username: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: username.toLowerCase(),
          },
        },
      })
      if (error) {
        // Ensure error has a usable message string
        const msg = typeof error.message === 'string' && error.message.trim()
          ? error.message
          : 'Une erreur est survenue lors de l\'inscription.'
        return { error: { message: msg } }
      }
      return { error: null }
    } catch {
      return { error: { message: 'Une erreur est survenue lors de l\'inscription.' } }
    }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    })
    if (error) return { error: { message: 'La connexion Google n\'est pas disponible pour le moment.' } }
    if (data?.url) {
      // Pre-check: verify the OAuth provider is configured before redirecting
      try {
        const res = await fetch(data.url, { redirect: 'manual' })
        if (res.type === 'opaqueredirect') {
          // Provider is configured — Supabase is redirecting to the OAuth provider
          window.location.href = data.url
          return { error: null }
        }
        // If we got a direct response (not a redirect), the provider may not be enabled
        if (res.status >= 400) {
          return {
            error: {
              message: 'La connexion Google n\'est pas disponible pour le moment.',
            },
          }
        }
        // Fallback: redirect anyway
        window.location.href = data.url
      } catch {
        // Network/CORS error — redirect and let the browser handle it
        window.location.href = data.url
      }
    }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return {
    user,
    profile,
    loading,
    signInWithEmail,
    signUpWithEmail,
    checkUsernameAvailable,
    signInWithGoogle,
    signOut,
    refreshProfile: () => user && fetchProfile(user.id),
  }
}
