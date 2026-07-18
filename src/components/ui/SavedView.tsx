'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CONTENT_TYPES, type PinDetail, type ContentType } from '@/types/database'

interface SavedViewProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
  onPinSelect: (pin: PinDetail) => void
  onAuthRequired: () => void
}

export default function SavedView({ isOpen, onClose, userId, onPinSelect, onAuthRequired }: SavedViewProps) {
  const [pins, setPins] = useState<PinDetail[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!isOpen) return

    if (!userId) {
      setPins([])
      return
    }

    const fetchSaved = async () => {
      const { data: savedPins } = await supabase
        .from('saved_pins')
        .select('pin_id')
        .eq('user_id', userId)

      if (savedPins && savedPins.length > 0) {
        const pinIds = savedPins.map((sp: { pin_id: string }) => sp.pin_id)
        const { data } = await supabase
          .from('pin_details')
          .select('*')
          .in('id', pinIds)

        if (data) setPins(data as PinDetail[])
      } else {
        setPins([])
      }
    }
    fetchSaved()
  }, [isOpen, userId, supabase])

  return (
    <div className={`view-overlay${isOpen ? ' open' : ''}`}>
      <div className="view-header">
        <span className="view-header-title">Sauvegardes</span>
        <button className="view-close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="view-content">
        {!userId ? (
          <div className="saved-empty">
            <div className="saved-empty-icon">☆</div>
            <p>Connectez-vous pour sauvegarder des pins</p>
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={onAuthRequired}>
              Se connecter
            </button>
          </div>
        ) : pins.length === 0 ? (
          <div className="saved-empty">
            <div className="saved-empty-icon">☆</div>
            <p>Aucun pin sauvegarde</p>
            <p style={{ color: 'var(--color-ink-lighter)', fontSize: 13, marginTop: 8 }}>
              Sauvegardez des pins pour les retrouver ici
            </p>
          </div>
        ) : (
          pins.map((p) => {
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
                <div className="feed-card-excerpt">{p.description}</div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
