'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/
const USERNAME_CHAR_REGEX = /^[a-z0-9_]*$/

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { signInWithEmail, signUpWithEmail, checkUsernameAvailable, signInWithGoogle } = useAuth()

  // Stable ref for the check function to avoid useEffect re-fires
  const checkUsernameRef = useRef(checkUsernameAvailable)
  checkUsernameRef.current = checkUsernameAvailable

  // Reset form when switching modes
  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode)
    setError('')
    setSuccessMsg('')
    setUsername('')
    setAgeConfirmed(false)
    setUsernameStatus('idle')
  }

  // Real-time username validation
  useEffect(() => {
    if (mode !== 'signup' || !username) {
      setUsernameStatus('idle')
      return
    }

    if (!USERNAME_CHAR_REGEX.test(username)) {
      setUsernameStatus('invalid')
      return
    }

    if (username.length < 3) {
      setUsernameStatus('idle')
      return
    }

    if (!USERNAME_REGEX.test(username)) {
      setUsernameStatus('invalid')
      return
    }

    setUsernameStatus('checking')

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const available = await checkUsernameRef.current(username)
      setUsernameStatus(available ? 'available' : 'taken')
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [username, mode])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signInWithEmail(email, password)
      if (error) {
        setError(error?.message || 'Une erreur est survenue.')
      } else {
        onSuccess?.()
        onClose()
      }
    } else {
      // Signup validations
      if (!USERNAME_REGEX.test(username)) {
        setError('Le nom d\'utilisateur doit contenir entre 3 et 20 caracteres (lettres, chiffres, _).')
        setLoading(false)
        return
      }
      if (usernameStatus === 'taken') {
        setError('Ce nom d\'utilisateur est deja pris.')
        setLoading(false)
        return
      }
      if (!ageConfirmed) {
        setError('Vous devez confirmer avoir 18 ans ou plus.')
        setLoading(false)
        return
      }

      const { error } = await signUpWithEmail(email, password, username)
      if (error) {
        setError(error?.message || 'Une erreur est survenue.')
      } else {
        setSuccessMsg('Verifiez votre email pour confirmer votre compte.')
      }
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setError('')
    const { error } = await signInWithGoogle()
    if (error) setError(error?.message || 'Une erreur est survenue.')
  }

  const isSignupDisabled =
    loading ||
    (mode === 'signup' && (
      usernameStatus !== 'available' ||
      !ageConfirmed ||
      !email ||
      password.length < 8
    ))

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">
          {mode === 'login' ? 'Se connecter' : 'Creer un compte'}
        </div>

        <div className="auth-modal-content">
          <div className="auth-message-slot">
            {error && <div className="auth-error">{error}</div>}
            {successMsg && (
              <div style={{ color: '#22a55b', fontSize: 12 }}>
                {successMsg}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="auth-username-field">
                <div className="auth-input-wrapper">
                  <span className="auth-input-prefix">@</span>
                  <input
                    type="text"
                    className="auth-input auth-input-with-prefix"
                    placeholder="nom_utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    maxLength={20}
                    required
                    autoComplete="username"
                  />
                  {usernameStatus === 'checking' && (
                    <span className="auth-username-indicator checking" aria-label="Verification en cours">...</span>
                  )}
                  {usernameStatus === 'available' && (
                    <span className="auth-username-indicator available" aria-label="Disponible">&#10003;</span>
                  )}
                  {usernameStatus === 'taken' && (
                    <span className="auth-username-indicator taken" aria-label="Deja pris">&#10007;</span>
                  )}
                  {usernameStatus === 'invalid' && (
                    <span className="auth-username-indicator taken" aria-label="Invalide">&#10007;</span>
                  )}
                </div>
                <div className="auth-field-hint-slot">
                  {usernameStatus === 'taken' && (
                    <div className="auth-field-hint error">Ce nom est deja pris</div>
                  )}
                  {usernameStatus === 'invalid' && (
                    <div className="auth-field-hint error">3-20 caracteres : lettres, chiffres, _</div>
                  )}
                  {usernameStatus === 'available' && (
                    <div className="auth-field-hint success">Disponible</div>
                  )}
                </div>
              </div>
            )}

            <input
              type="email"
              className="auth-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <input
              type="password"
              className="auth-input"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />

            {mode === 'signup' && (
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                />
                <span>Je confirme avoir 18 ans ou plus</span>
              </label>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%' }}
              disabled={mode === 'signup' ? isSignupDisabled : loading}
            >
              {loading
                ? '...'
                : mode === 'login'
                ? 'Se connecter'
                : "S'inscrire"}
            </button>

            {mode === 'signup' && (
              <div className="auth-terms">
                En creant un compte, vous acceptez les{' '}
                <a href="/conditions" target="_blank" rel="noopener">Conditions d&apos;utilisation</a>
                {' '}et la{' '}
                <a href="/confidentialite" target="_blank" rel="noopener">Politique de confidentialite</a>
                {' '}d&apos;Affleure.
              </div>
            )}
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
                <button onClick={() => switchMode('signup')}>
                  S&apos;inscrire
                </button>
              </>
            ) : (
              <>
                Deja un compte ?{' '}
                <button onClick={() => switchMode('login')}>
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
