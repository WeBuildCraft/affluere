'use client'

import { CONTENT_TYPES, type ContentType } from '@/types/database'

interface FilterBarProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'Tout' },
  ...Object.entries(CONTENT_TYPES).map(([key, { label }]) => ({ key, label })),
]

export default function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="filter-bar">
      {FILTERS.map(({ key, label }) => (
        <button
          key={key}
          className={`filter-chip${activeFilter === key ? ' active' : ''}`}
          onClick={() => onFilterChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
