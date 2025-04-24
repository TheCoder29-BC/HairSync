import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, notice } = useAuth() // 🔁 Hinweis aus AuthContext

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registrierung fehlgeschlagen')
        return
      }

      login({
        user: data.user,
        access_token: data.access_token,
        refresh_token: data.refresh_token
      })

    } catch (err) {
      console.error('Fehler bei Registrierung:', err)
      setError('Verbindungsfehler bei der Registrierung.')
    }
  }

  return (
    <form onSubmit={handleRegister}>
      <h2>Registrieren</h2>

      {/* 🔔 Session Hinweis */}
      {notice && <p style={{ color: 'orange' }}>{notice}</p>}

      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Passwort"
        required
      />
      <button type="submit">Registrieren</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}
