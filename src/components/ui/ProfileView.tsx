'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CONTENT_TYPES, type Profile, type PinDetail, type ContentType } from '@/types/database'

interface ProfileViewProps {
  isOpen: boolean
  onClose: () => void
  profile: Profile | null
  userId: string | null
  onPinSelect: (pin: PinDetail) => void
  onAuthRequired: () => void
  onSignOut: () => void
}

export default function ProfileView({
  isOpen,
  onClose,
  profile,
  userId,
  onPinSelect,
  onAuthRequired,
  onSignOut,
}: ProfileViewProps) {
  const [myPins, setMyPins] = useState<PinDetail[]>([])
  const [savedCount, setSavedCount] = useState(0)
  const [totalReactions, setTotalReactions] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (!isOpen || !userId) return

    const fetchData = async () => {
      const { data: pins } = await supabase
        .from('pin_details')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false })

      if (pins) {
        setMyPins(pins as PinDetail[])
        setTotalReactions(pins.reduce((s: number, p: PinDetail) => s + (p.reaction_count || 0), 0))
      }

      const { count } = await supabase
        .from('saved_pins')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)

      setSavedCount(count || 0)
    }
    fetchData()
  }, [isOpen, userId, supabase])

  const initial = (profile?.display_name || profile?.username || '?')[0].toUpperCase()

  return (
    <div className={`view-overlay${isOpen ? ' open' : ''}`}>
      <div className="view-header">
        <span className="view-header-title">Profil</span>
        <button className="view-close-btn" onClick={onClose}>✕</button>
      </div>

      {!userId || !profile ? (
        <div className="saved-empty">
          <div className="saved-empty-icon">👤</div>
          <p>Connectez-vous pour voir votre profil</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={onAuthRequired}>
            Se connecter
          </button>
        </div>
      ) : (
        <>
          <div className="profile-header">
            <div className="profile-avatar">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" />
              ) : (
                initial
              )}
            </div>
            <div className="profile-name">
              {profile.display_name || profile.username}
            </div>
            <div className="profile-handle">
              @{profile.username} · {profile.city || 'Bordeaux'}
            </div>
            {profile.bio && <div className="profile-bio">{profile.bio}</div>}
          </div>

          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat-num">{myPins.length}</div>
              <div className="profile-stat-label">Pins</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-num">{totalReactions}</div>
              <div className="profile-stat-label">Reactions</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-num">{savedCount}</div>
              <div className="profile-stat-label">Sauvegardes</div>
            </div>
          </div>

          <div className="view-content">
            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--color-ink-lighter)', marginBottom: 16,
            }}>
              Mes pins
            </div>
            {myPins.map((p) => {
              const typeInfo = CONTENT_TYPES[p.content_type as ContentType]
              return (
                <div
                  key={p.id}
                  className="feed-card"
                  onClick={() => { onPinSelect(p); onClose() }}
                >
                  <div className="feed-card-meta">
                    <span className="feed-card-dot" style={{ background: typeInfo?.color }} />
                    {typeInfo?.label} · {p.location_name}
                  </div>
                  <div className="feed-card-title">{p.title}</div>
                </div>
              )
            })}

            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <button className="btn-outline" onClick={onSignOut}>
                Se deconnecter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
