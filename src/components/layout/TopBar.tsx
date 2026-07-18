'use client'

interface TopBarProps {
  onSearchToggle: () => void
  onCreateClick: () => void
}

export default function TopBar({ onSearchToggle, onCreateClick }: TopBarProps) {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <button className="top-bar-help" onClick={onSearchToggle} title="Chercher">
          ?
        </button>
      </div>
      <span className="top-bar-title">Affleure</span>
      <button className="top-bar-add" onClick={onCreateClick} title="Deposer un pin">
        +
      </button>
    </div>
  )
}
