// src/pages/Login.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate }         from 'react-router-dom'
import { useAuth }                   from '../context/AuthContext.jsx'
import styles                        from './Login.module.css'

export default function Login() {
  const { session, login, logout } = useAuth()
  const navigate                    = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  // Wenn bereits eingeloggt, direkt umleiten
  useEffect(() => {
    if (!session) return
    const role = session.user.user_metadata?.role
    if (role === 'customer') {
      navigate('/barbershops', { replace: true })
    } else if (role === 'barbershop') {
      navigate('/barbershop-dashboard', { replace: true })
    }
  }, [session, navigate])

  const handleLogin = async e => {
    e.preventDefault()
    setError('')

    const { data, error } = await login(email, password)
    if (error) {
      setError(error.message)
      return
    }

    // Rolle auslesen und umleiten
    const role = data.session?.user?.user_metadata?.role
    if (role === 'customer') {
      navigate('/barbershops', { replace: true })
    } else if (role === 'barbershop') {
      navigate('/barbershop-dashboard', { replace: true })
    } else {
      setError('Unbekannte Rolle – bitte neu anmelden.')
      await logout()
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleLogin} className={styles.card}>
        <h2 className={styles.title}>Login</h2>
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.field}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label>Passwort</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Passwort-vergessen-Link */}
        <p className={styles.forgot}>
          <Link to="/forgot-password" className={styles.link}>
            Passwort vergessen?
          </Link>
        </p>

        <button type="submit" className={styles.button}>
          Einloggen
        </button>

        <div className={styles.footer}>
          Noch kein Konto?{' '}
          <Link to="/register" className={styles.link}>
            Kunde registrieren
          </Link>
          <br />
          Barbershop?{' '}
          <Link to="/register-barbershop" className={styles.link}>
            Jetzt registrieren
          </Link>
        </div>
      </form>
    </div>
  )
}
