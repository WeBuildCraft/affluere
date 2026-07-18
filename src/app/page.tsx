'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import type { PinDetail } from '@/types/database'
import type maplibregl from 'maplibre-gl'

import TopBar from '@/components/layout/TopBar'
import BottomBar from '@/components/layout/BottomBar'
import FilterBar from '@/components/layout/FilterBar'
import SearchOverlay from '@/components/layout/SearchOverlay'
import PinDetailPanel from '@/components/pin/PinDetail'
import CreateFlow from '@/components/pin/CreateFlow'
import AuthModal from '@/components/auth/AuthModal'
import Toast from '@/components/ui/Toast'
import ExploreView from '@/components/ui/ExploreView'
import SavedView from '@/components/ui/SavedView'
import ProfileView from '@/components/ui/ProfileView'
import NotificationsView from '@/components/ui/NotificationsView'

// Dynamic import for MapView (no SSR — MapLibre needs the DOM)
const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false })

export default function Home() {
  const { user, profile, signOut } = useAuth()
  const { message: toastMsg, visible: toastVisible, showToast } = useToast()
  const supabase = createClient()

  // State
  const [pins, setPins] = useState<PinDetail[]>([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedPin, setSelectedPin] = useState<PinDetail | null>(null)
  const [pinDetailOpen, setPinDetailOpen] = useState(false)
  const [coords, setCoords] = useState('44.8420°N 0.5700°W')
  const [searchOpen, setSearchOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)
  const [savedOpen, setSavedOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [crosshairVisible, setCrosshairVisible] = useState(false)

  const mapRef = useRef<maplibregl.Map | null>(null)
  const pendingActionRef = useRef<(() => void) | null>(null)

  // Fetch pins
  const fetchPins = useCallback(async () => {
    const { data } = await supabase
      .from('pin_details')
      .select('*')
      .eq('visibility', 'published')
      .order('created_at', { ascending: false })
      .limit(200)

    if (data) setPins(data as PinDetail[])
  }, [supabase])

  useEffect(() => {
    fetchPins()
  }, [fetchPins])

  // Map ready handler
  const handleMapReady = useCallback((map: maplibregl.Map) => {
    mapRef.current = map
  }, [])

  // Pin click handler
  const handlePinClick = useCallback((pinId: string) => {
    const pin = pins.find((p) => p.id === pinId)
    if (pin) {
      setSelectedPin(pin)
      setPinDetailOpen(true)
      mapRef.current?.flyTo({
        center: [pin.longitude, pin.latitude],
        zoom: Math.max(mapRef.current.getZoom(), 16),
        duration: 800,
      })
    }
  }, [pins])

  // Pin select from feed views
  const handlePinSelect = useCallback((pin: PinDetail) => {
    setSelectedPin(pin)
    setPinDetailOpen(true)
    mapRef.current?.flyTo({
      center: [pin.longitude, pin.latitude],
      zoom: 16,
      pitch: 55,
      duration: 800,
    })
  }, [])

  // Auth-gated actions
  const requireAuth = useCallback((action?: () => void) => {
    if (user) {
      action?.()
    } else {
      pendingActionRef.current = action || null
      setAuthOpen(true)
    }
  }, [user])

  const handleAuthSuccess = useCallback(() => {
    if (pendingActionRef.current) {
      pendingActionRef.current()
      pendingActionRef.current = null
    }
  }, [])

  // Create flow
  const handleCreateClick = useCallback(() => {
    requireAuth(() => {
      setCreateOpen(true)
      setCrosshairVisible(true)
    })
  }, [requireAuth])

  const handleCreateClose = useCallback(() => {
    setCreateOpen(false)
    setCrosshairVisible(false)
  }, [])

  // Random
  const handleRandom = useCallback(() => {
    const filteredPins = activeFilter === 'all'
      ? pins
      : pins.filter((p) => p.content_type === activeFilter)

    if (filteredPins.length === 0) return
    const pin = filteredPins[Math.floor(Math.random() * filteredPins.length)]

    mapRef.current?.flyTo({
      center: [pin.longitude, pin.latitude],
      zoom: 16.5,
      pitch: 60,
      bearing: Math.random() * 40 - 20,
      duration: 1500,
    })

    setTimeout(() => {
      setSelectedPin(pin)
      setPinDetailOpen(true)
    }, 1600)
  }, [pins, activeFilter])

  // Search
  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) return
    const q = query.toLowerCase()
    const match = pins.find((p) =>
      p.title?.toLowerCase().includes(q) ||
      p.location_name?.toLowerCase().includes(q) ||
      p.neighbourhood?.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q)
    )
    if (match) {
      mapRef.current?.flyTo({
        center: [match.longitude, match.latitude],
        zoom: 16, pitch: 55, duration: 800,
      })
      setTimeout(() => {
        setSearchOpen(false)
        setSelectedPin(match)
        setPinDetailOpen(true)
      }, 900)
    }
  }, [pins])

  return (
    <>
      {/* Map */}
      <MapView
        pins={pins}
        activeFilter={activeFilter}
        onPinClick={handlePinClick}
        onCoordsChange={setCoords}
        onMapReady={handleMapReady}
      />

      {/* Crosshair for pin placement */}
      <div className={`crosshair${crosshairVisible ? ' show' : ''}`}>
        <div className="crosshair-dot" />
        <div className="crosshair-label">Deplacez la carte</div>
      </div>

      {/* UI Layers */}
      <TopBar
        onSearchToggle={() => setSearchOpen(!searchOpen)}
        onCreateClick={handleCreateClick}
      />

      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <BottomBar
        onExplore={() => setExploreOpen(true)}
        onSaved={() => setSavedOpen(true)}
        onRandom={handleRandom}
        onProfile={() => setProfileOpen(true)}
        onNotifications={() => setNotifOpen(true)}
        coords={coords}
        location="Bordeaux Metropole"
      />

      {/* Search */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSearch={handleSearch}
      />

      {/* Pin Detail */}
      <PinDetailPanel
        pin={selectedPin}
        isOpen={pinDetailOpen}
        onClose={() => { setPinDetailOpen(false); setSelectedPin(null) }}
        userId={user?.id || null}
        onAuthRequired={() => requireAuth()}
        onToast={showToast}
      />

      {/* Create Flow */}
      {user && (
        <CreateFlow
          isOpen={createOpen}
          onClose={handleCreateClose}
          userId={user.id}
          map={mapRef.current}
          onToast={showToast}
          onPinCreated={fetchPins}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* View Overlays */}
      <ExploreView
        isOpen={exploreOpen}
        onClose={() => setExploreOpen(false)}
        onPinSelect={handlePinSelect}
      />

      <SavedView
        isOpen={savedOpen}
        onClose={() => setSavedOpen(false)}
        userId={user?.id || null}
        onPinSelect={handlePinSelect}
        onAuthRequired={() => requireAuth()}
      />

      <ProfileView
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
        userId={user?.id || null}
        onPinSelect={handlePinSelect}
        onAuthRequired={() => requireAuth()}
        onSignOut={signOut}
      />

      <NotificationsView
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        userId={user?.id || null}
        onAuthRequired={() => requireAuth()}
      />

      {/* Toast */}
      <Toast message={toastMsg} visible={toastVisible} />
    </>
  )
}
