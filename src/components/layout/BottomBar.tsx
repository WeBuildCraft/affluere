'use client'

interface BottomBarProps {
  onExplore: () => void
  onSaved: () => void
  onRandom: () => void
  onProfile: () => void
  onNotifications: () => void
  coords: string
  location: string
}

export default function BottomBar({
  onExplore,
  onSaved,
  onRandom,
  onProfile,
  onNotifications,
  coords,
  location,
}: BottomBarProps) {
  const now = new Date()
  const months = ['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre']
  const dateStr = `${months[now.getMonth()]} ${now.getFullYear()}`

  return (
    <div className="bottom-bar">
      <div className="bottom-bar-main">
        <button className="bottom-bar-nav-btn" onClick={onExplore} title="Explorer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
          </svg>
        </button>
        <button className="bottom-bar-nav-btn" onClick={onSaved} title="Sauvegardes">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
        <button className="bottom-bar-random" onClick={onRandom} title="Au hasard">
          Au hasard
        </button>
        <button className="bottom-bar-nav-btn" onClick={onProfile} title="Profil">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
        <button className="bottom-bar-nav-btn" onClick={onNotifications} title="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
      </div>
      <div className="bottom-bar-meta">
        <span>{location}</span>
        <span>{coords}</span>
        <span>{dateStr}</span>
      </div>
    </div>
  )
}
