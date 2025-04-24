import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, notice } = useAuth() // 🆕 Hinweis holen

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login fehlgeschlagen')
        return
      }

      login({
        user: data.user,
        access_token: data.access_token,
        refresh_token: data.refresh_token
      })

    } catch (err) {
      console.error('Login-Fehler:', err)
      setError('Verbindungsfehler beim Login.')
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>

      {/* Hinweis bei Session-Abbruch */}
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
      <button type="submit">Login</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}
