import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { login } = useAuth()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()
      console.log('🔁 Server-Antwort von /register:', data)

      if (!res.ok) {
        setError(data.error || 'Registrierung fehlgeschlagen')
        return
      }

      // Erfolgreich registriert → Login direkt durchführen
      login({
        user: data.user,
        access_token: data.access_token,
        refresh_token: data.refresh_token
      })

    } catch (err) {
      console.error('❌ Fehler beim Registrieren:', err)
      setError('Verbindung zum Server fehlgeschlagen')
    }
  }

  return (
    <form onSubmit={handleRegister}>
      <h2>Registrieren</h2>

      <input
        type="email"
        placeholder="E-Mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Passwort"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit">Registrieren</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}
