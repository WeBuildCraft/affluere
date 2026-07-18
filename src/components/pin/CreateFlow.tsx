'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CONTENT_TYPES, type ContentType } from '@/types/database'
import type maplibregl from 'maplibre-gl'

const TYPE_DESCRIPTIONS: Record<ContentType, string> = {
  observation: 'Un detail remarque',
  story: 'Une histoire personnelle',
  photo: 'Un instant capture',
  question: 'Une curiosite',
  conversation: 'Un echange ouvert',
}

interface CreateFlowProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  map: maplibregl.Map | null
  onToast: (msg: string) => void
  onPinCreated: () => void
}

export default function CreateFlow({
  isOpen,
  onClose,
  userId,
  map,
  onToast,
  onPinCreated,
}: CreateFlowProps) {
  const [step, setStep] = useState(0)
  const [contentType, setContentType] = useState<ContentType | ''>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const center = map?.getCenter()
  const lat = center ? center.lat.toFixed(4) : '44.8420'
  const lng = center ? Math.abs(center.lng).toFixed(4) : '0.5700'

  const reset = () => {
    setStep(0)
    setContentType('')
    setTitle('')
    setDescription('')
    setSubmitting(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handlePublish = async () => {
    if (!contentType || !center) return
    setSubmitting(true)

    const { error } = await supabase.from('pins').insert({
      creator_id: userId,
      latitude: parseFloat(center.lat.toFixed(4)),
      longitude: parseFloat(center.lng.toFixed(4)),
      location_name: 'Bordeaux',
      city: 'bordeaux',
      content_type: contentType,
      title: title || null,
      description: description || null,
    })

    if (error) {
      onToast(error.message.includes('Rate limit') ? 'Limite atteinte : 10 pins par jour' : 'Erreur lors de la publication')
      setSubmitting(false)
    } else {
      handleClose()
      onToast('Pin publie !')
      onPinCreated()
    }
  }

  if (!isOpen) return null

  return (
    <div className={`create-panel${isOpen ? ' open' : ''}`}>
      <div className="create-header">
        <span className="create-header-title">Deposer un pin</span>
        <button className="view-close-btn" onClick={handleClose}>✕</button>
      </div>

      {/* Step dots */}
      <div className="create-steps">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`create-step-dot${i < step ? ' done' : ''}${i === step ? ' active' : ''}`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="create-body">
        {step === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>
              Choisissez l&apos;emplacement
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-light)', marginBottom: 24 }}>
              Deplacez la carte pour positionner le pin
            </div>
            <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--color-ink-lighter)' }}>
              {lat}°N, {lng}°W
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 4 }}>
              Type de contenu
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-light)', marginBottom: 20 }}>
              Que souhaitez-vous partager ?
            </div>
            <div className="type-grid">
              {(Object.entries(CONTENT_TYPES) as [ContentType, { label: string; color: string }][]).map(
                ([key, { label, color }]) => (
                  <button
                    key={key}
                    className={`type-option${contentType === key ? ' selected' : ''}`}
                    onClick={() => setContentType(key)}
                  >
                    <div className="type-option-dot" style={{ background: color }} />
                    <div className="type-option-name">{label}</div>
                    <div className="type-option-desc">{TYPE_DESCRIPTIONS[key]}</div>
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 16 }}>
              Votre {contentType ? CONTENT_TYPES[contentType as ContentType].label.toLowerCase() : ''}
            </div>
            <label className="create-label">Titre</label>
            <input
              className="create-input"
              placeholder="Donnez un titre..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label className="create-label">Contenu</label>
            <textarea
              className="create-textarea"
              placeholder="Racontez..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 16 }}>
              Apercu
            </div>
            <div className="preview-card">
              <div className="preview-meta">
                <span
                  className="feed-card-dot"
                  style={{
                    background: contentType ? CONTENT_TYPES[contentType as ContentType].color : '#ccc',
                    display: 'inline-block', width: 7, height: 7,
                    borderRadius: '50%', verticalAlign: 'middle', marginRight: 4,
                  }}
                />
                {contentType ? CONTENT_TYPES[contentType as ContentType].label : ''} · Aujourd&apos;hui · {lat}°N
              </div>
              <div className="preview-title">{title || 'Sans titre'}</div>
              <div className="preview-text">{description}</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="create-footer">
        {step === 0 && (
          <button className="btn-primary" onClick={() => setStep(1)}>
            Confirmer le lieu
          </button>
        )}
        {step === 1 && (
          <>
            <button className="btn-outline" onClick={() => setStep(0)}>Retour</button>
            <button
              className="btn-primary"
              onClick={() => setStep(2)}
              disabled={!contentType}
            >
              Suivant
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <button className="btn-outline" onClick={() => setStep(1)}>Retour</button>
            <button className="btn-primary" onClick={() => setStep(3)}>Apercu</button>
          </>
        )}
        {step === 3 && (
          <>
            <button className="btn-outline" onClick={() => setStep(2)}>Modifier</button>
            <button
              className="btn-primary"
              onClick={handlePublish}
              disabled={submitting}
            >
              {submitting ? '...' : 'Publier'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
