'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CONTENT_TYPES, type PinDetail, type ContentType } from '@/types/database'

interface ExploreViewProps {
  isOpen: boolean
  onClose: () => void
  onPinSelect: (pin: PinDetail) => void
}

export default function ExploreView({ isOpen, onClose, onPinSelect }: ExploreViewProps) {
  const [pins, setPins] = useState<PinDetail[]>([])
  const [cityFilter, setCityFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent')
  const supabase = createClient()

  useEffect(() => {
    if (!isOpen) return
    const fetchPins = async () => {
      let query = supabase
        .from('pin_details')
        .select('*')
        .eq('visibility', 'published')

      if (cityFilter !== 'all') {
        query = query.eq('city', cityFilter.toLowerCase())
      }

      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false })
      } else {
        query = query.order('reaction_count', { ascending: false })
      }

      const { data } = await query.limit(50)
      if (data) setPins(data as PinDetail[])
    }
    fetchPins()
  }, [isOpen, cityFilter, sortBy, supabase])

  const cities = ['all', 'Bordeaux', 'Lormont', 'Cenon']

  return (
    <div className={`view-overlay${isOpen ? ' open' : ''}`}>
      <div className="view-header">
        <span className="view-header-title">Explorer</span>
        <button className="view-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="explore-tabs">
        {cities.map((city) => (
          <button
            key={city}
            className={`explore-tab${cityFilter === city ? ' active' : ''}`}
            onClick={() => setCityFilter(city)}
          >
            {city === 'all' ? 'Tout' : city}
          </button>
        ))}
      </div>

      <div className="explore-sort">
        <span>Trier :</span>
        <button
          className={sortBy === 'recent' ? 'active' : ''}
          onClick={() => setSortBy('recent')}
        >
          Recent
        </button>
        <button
          className={sortBy === 'popular' ? 'active' : ''}
          onClick={() => setSortBy('popular')}
        >
          Populaire
        </button>
      </div>

      <div className="view-content">
        {pins.length === 0 ? (
          <div className="saved-empty">
            <div className="saved-empty-icon">🔍</div>
            <p>Aucun pin dans cette ville</p>
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
                  {typeInfo?.label} · {p.city}
                </div>
                <div className="feed-card-title">{p.title}</div>
                <div className="feed-card-excerpt">{p.description}</div>
                <div className="feed-card-footer">
                  <span>@{p.author_username}</span>
                  <span>·</span>
                  <span>{p.reaction_count} reactions</span>
                  <span>·</span>
                  <span>{p.comment_count} commentaires</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
