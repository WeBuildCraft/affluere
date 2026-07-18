'use client'

interface ToastProps {
  message: string
  visible: boolean
}

export default function Toast({ message, visible }: ToastProps) {
  return (
    <div className="toast-container">
      <div className={`toast${visible ? ' show' : ''}`}>{message}</div>
    </div>
  )
}
