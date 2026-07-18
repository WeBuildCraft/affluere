'use client'

import { useState, useCallback, useRef } from 'react'

export function useToast() {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setMessage(msg)
    setVisible(true)
    timeoutRef.current = setTimeout(() => setVisible(false), 2500)
  }, [])

  return { message, visible, showToast }
}
