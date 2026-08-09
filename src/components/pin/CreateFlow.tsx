'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CONTENT_TYPES, type ContentType } from '@/types/database'
import { reverseGeocode, forwardGeocode, type GeocodedLocation, type ForwardResult } from '@/lib/geocoding'
import { extractGps } from '@/lib/exif'
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

  // Location state
  const [location, setLocation] = useState<GeocodedLocation | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [manualLat, setManualLat] = useState<number | null>(null)
  const [manualLng, setManualLng] = useState<number | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ForwardResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Photo EXIF state
  const [exifDetected, setExifDetected] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Photo upload state (for "photo" content type)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  // Effective coordinates: manual override (from search/EXIF) or map center
  const center = map?.getCenter()
  const effectiveLat = manualLat ?? (center ? center.lat : 44.8420)
  const effectiveLng = manualLng ?? (center ? center.lng : -0.5700)
  const displayLat = effectiveLat.toFixed(4)
  const displayLng = Math.abs(effectiveLng).toFixed(4)

  // Reverse geocode when step 0 is active and coordinates change
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastGeocodedRef = useRef<string>('')

  const doReverseGeocode = useCallback(async (lat: number, lng: number) => {
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`
    if (key === lastGeocodedRef.current) return
    lastGeocodedRef.current = key
    setLocationLoading(true)
    const result = await reverseGeocode(lat, lng)
    setLocation(result)
    setLocationLoading(false)
  }, [])

  // When the panel opens or map moves during step 0, reverse geocode
  useEffect(() => {
    if (!isOpen || step !== 0) return
    if (manualLat !== null) return // manual override, already geocoded

    const handleMove = () => {
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current)
      const c = map?.getCenter()
      if (!c) return
      geocodeTimer.current = setTimeout(() => {
        doReverseGeocode(c.lat, c.lng)
      }, 600)
    }

    // Initial geocode
    if (center) {
      doReverseGeocode(center.lat, center.lng)
    }

    map?.on('moveend', handleMove)
    return () => {
      map?.off('moveend', handleMove)
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current)
    }
  }, [isOpen, step, map, center, manualLat, doReverseGeocode])

  // Forward geocode search (debounced)
  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (!q.trim()) {
      setSearchResults([])
      return
    }
    setSearchLoading(true)
    searchTimeout.current = setTimeout(async () => {
      const results = await forwardGeocode(q)
      setSearchResults(results)
      setSearchLoading(false)
    }, 500)
  }, [])

  // Select a search result
  const handleSearchSelect = useCallback((result: ForwardResult) => {
    setManualLat(result.lat)
    setManualLng(result.lng)
    setLocation({
      location_name: result.location_name,
      city: result.city,
      neighbourhood: result.neighbourhood,
    })
    setSearchQuery('')
    setSearchResults([])
    // Fly map to the selected location
    map?.flyTo({
      center: [result.lng, result.lat],
      zoom: 17,
      duration: 800,
    })
  }, [map])

  // EXIF photo upload handler
  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const gps = await extractGps(file)
    if (gps) {
      setManualLat(gps.latitude)
      setManualLng(gps.longitude)
      setExifDetected(true)
      // Reverse geocode the EXIF location
      setLocationLoading(true)
      const loc = await reverseGeocode(gps.latitude, gps.longitude)
      setLocation(loc)
      setLocationLoading(false)
      // Fly map to EXIF location
      map?.flyTo({
        center: [gps.longitude, gps.latitude],
        zoom: 17,
        duration: 800,
      })
      onToast('Position GPS detectee depuis la photo')
    } else {
      onToast('Pas de donnees GPS dans cette photo')
    }
    // Reset file input so user can re-upload
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [map, onToast])

  // Clear manual override (go back to map center)
  const clearManualLocation = useCallback(() => {
    setManualLat(null)
    setManualLng(null)
    setExifDetected(false)
    lastGeocodedRef.current = '' // force re-geocode
    if (center) {
      doReverseGeocode(center.lat, center.lng)
    }
  }, [center, doReverseGeocode])

  const reset = () => {
    setStep(0)
    setContentType('')
    setTitle('')
    setDescription('')
    setSubmitting(false)
    setLocation(null)
    setLocationLoading(false)
    setManualLat(null)
    setManualLng(null)
    setSearchQuery('')
    setSearchResults([])
    setExifDetected(false)
    lastGeocodedRef.current = ''
    // Clean up photo upload state
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handlePublish = async () => {
    if (!contentType) return
    setSubmitting(true)

    const finalLat = parseFloat(effectiveLat.toFixed(4))
    const finalLng = parseFloat(effectiveLng.toFixed(4))

    const { data: pinData, error } = await supabase.from('pins').insert({
      creator_id: userId,
      latitude: finalLat,
      longitude: finalLng,
      location_name: location?.location_name || 'Bordeaux',
      city: location?.city || 'bordeaux',
      neighbourhood: location?.neighbourhood || null,
      content_type: contentType,
      title: title || null,
      description: description || null,
    }).select('id').single()

    if (error) {
      onToast(error.message.includes('Rate limit') ? 'Limite atteinte : 10 pins par jour' : 'Erreur lors de la publication')
      setSubmitting(false)
      return
    }

    // Upload photo if one was selected
    if (photoFile && pinData?.id) {
      const ext = photoFile.name.split('.').pop() || 'jpg'
      const path = `${userId}/${pinData.id}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('pin-photos')
        .upload(path, photoFile, { contentType: photoFile.type })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('pin-photos')
          .getPublicUrl(path)

        await supabase.from('photos').insert({
          pin_id: pinData.id,
          url: urlData.publicUrl,
          alt_text: title || null,
          position: 0,
        })
      }
    }

    handleClose()
    onToast('Pin publie !')
    onPinCreated()
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
          <div style={{ padding: '12px 0' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12, textAlign: 'center' }}>
              Choisissez l&apos;emplacement
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-light)', marginBottom: 16, textAlign: 'center' }}>
              Deplacez la carte, cherchez une adresse, ou importez une photo avec GPS
            </div>

            {/* Search bar */}
            <label className="create-label">Chercher un lieu</label>
            <input
              className="create-input"
              placeholder="Rue, quartier, lieu-dit..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />

            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <div style={{
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                marginTop: 4,
                marginBottom: 12,
                maxHeight: 180,
                overflowY: 'auto',
                background: 'var(--color-bg)',
              }}>
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearchSelect(r)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      border: 'none',
                      borderBottom: i < searchResults.length - 1 ? '1px solid var(--color-border)' : 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontSize: 13,
                      color: 'var(--color-ink)',
                      lineHeight: 1.4,
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>{r.location_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-ink-lighter)', marginTop: 2 }}>
                      {r.display_name.length > 60 ? r.display_name.slice(0, 60) + '...' : r.display_name}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchLoading && (
              <div style={{ fontSize: 12, color: 'var(--color-ink-lighter)', marginBottom: 8 }}>
                Recherche...
              </div>
            )}

            {/* Photo GPS import */}
            <label className="create-label" style={{ marginTop: 8 }}>Importer la position GPS d&apos;une photo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 0',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                color: 'var(--color-ink)',
                marginBottom: 12,
              }}
            />

            {/* Resolved location display */}
            <div style={{
              marginTop: 8,
              padding: '12px',
              borderRadius: 8,
              background: 'rgba(0,0,0,0.03)',
              textAlign: 'center',
            }}>
              {locationLoading ? (
                <div style={{ fontSize: 13, color: 'var(--color-ink-lighter)' }}>
                  Resolution de l&apos;adresse...
                </div>
              ) : location ? (
                <>
                  <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--color-ink)', marginBottom: 4 }}>
                    {location.location_name}
                  </div>
                  {location.neighbourhood && (
                    <div style={{ fontSize: 12, color: 'var(--color-ink-light)', marginBottom: 4 }}>
                      {location.neighbourhood}
                    </div>
                  )}
                  <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--color-ink-lighter)' }}>
                    {displayLat}°N, {displayLng}°W
                  </div>
                  {(manualLat !== null) && (
                    <button
                      onClick={clearManualLocation}
                      style={{
                        marginTop: 8,
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        fontSize: 12,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        textDecoration: 'underline',
                      }}
                    >
                      {exifDetected ? 'Ignorer la position GPS de la photo' : 'Utiliser la position de la carte'}
                    </button>
                  )}
                </>
              ) : (
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--color-ink-lighter)' }}>
                  {displayLat}°N, {displayLng}°W
                </div>
              )}
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

            {/* Photo upload — only for "photo" content type */}
            {contentType === 'photo' && (
              <div style={{ marginBottom: 20 }}>
                <label className="create-label">Photo</label>
                {photoPreview ? (
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <img
                      src={photoPreview}
                      alt="Apercu"
                      style={{
                        width: '100%',
                        maxHeight: 240,
                        objectFit: 'cover',
                        borderRadius: 8,
                        display: 'block',
                      }}
                    />
                    <button
                      onClick={() => {
                        URL.revokeObjectURL(photoPreview)
                        setPhotoFile(null)
                        setPhotoPreview(null)
                        if (photoInputRef.current) photoInputRef.current.value = ''
                      }}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.5)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    style={{
                      width: '100%',
                      padding: '32px 16px',
                      border: '2px dashed var(--color-rule)',
                      borderRadius: 8,
                      background: 'transparent',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontSize: 14,
                      color: 'var(--color-ink-light)',
                      textAlign: 'center',
                      marginBottom: 8,
                    }}
                  >
                    Choisir une photo
                  </button>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setPhotoFile(file)
                      setPhotoPreview(URL.createObjectURL(file))
                    }
                  }}
                />
              </div>
            )}

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
                {contentType ? CONTENT_TYPES[contentType as ContentType].label : ''} · Aujourd&apos;hui · {location?.location_name || `${displayLat}°N`}
              </div>
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Apercu"
                  style={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'cover',
                    borderRadius: 4,
                    marginBottom: 8,
                  }}
                />
              )}
              <div className="preview-title">{title || 'Sans titre'}</div>
              <div className="preview-text">{description}</div>
              {location?.neighbourhood && (
                <div style={{ fontSize: 11, color: 'var(--color-ink-lighter)', marginTop: 6 }}>
                  {location.neighbourhood}, {location.city}
                </div>
              )}
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
