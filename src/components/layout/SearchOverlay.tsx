'use client'

import { useRef, useEffect } from 'react'

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string) => void
}

export default function SearchOverlay({ isOpen, onClose, onSearch }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  return (
    <div className={`search-overlay${isOpen ? ' open' : ''}`}>
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder="Chercher un lieu, un pin..."
        autoComplete="off"
        onChange={(e) => onSearch(e.target.value)}
      />
      <button className="search-close" onClick={onClose}>
        ✕
      </button>
    </div>
  )
}
