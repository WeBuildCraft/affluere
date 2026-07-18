'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signInWithEmail(email, password)
      if (error) {
        setError(error.message)
      } else {
        onSuccess?.()
        onClose()
      }
    } else {
      const { error } = await signUpWithEmail(email, password)
      if (error) {
        setError(error.message)
      } else {
        setSuccessMsg('Verifiez votre email pour confirmer votre compte.')
      }
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setError('')
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">
          {mode === 'login' ? 'Se connecter' : 'Creer un compte'}
        </div>

        <div className="auth-modal-content">
          {error && <div className="auth-error">{error}</div>}
          {successMsg && (
            <div style={{ color: '#22a55b', fontSize: 12, marginBottom: 8 }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              className="auth-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="auth-input"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading
                ? '...'
                : mode === 'login'
                ? 'Se connecter'
                : "S'inscrire"}
            </button>
          </form>

          <div className="auth-divider">ou</div>

          <button className="auth-google-btn" onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.99-.15-1.17z" fill="#4285F4"/>
              <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.47-1.63.77-2.7.77-2.08 0-3.83-1.4-4.46-3.29H1.87v2.07A8 8 0 008.98 17z" fill="#34A853"/>
              <path d="M4.52 10.53a4.8 4.8 0 010-3.06V5.4H1.87a8 8 0 000 7.2l2.65-2.07z" fill="#FBBC05"/>
              <path d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.87 5.4l2.65 2.07c.63-1.89 2.38-3.29 4.46-3.29z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>

          <div className="auth-switch">
            {mode === 'login' ? (
              <>
                Pas encore de compte ?{' '}
                <button onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}>
                  S&apos;inscrire
                </button>
              </>
            ) : (
              <>
                Deja un compte ?{' '}
                <button onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}>
                  Se connecter
                </button>
              </>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-outline" onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  )
}
