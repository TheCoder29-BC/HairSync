// web/src/pages/BarberLogin.jsx
import React, { useState } from 'react'
import { supabase } from '../supabase/client.js'
import { useNavigate, Link } from 'react-router-dom'
import styles from './Login.module.css'

export default function BarberLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      return
    }

    const role = data.user.user_metadata?.role
    if (role !== 'barber') {
      setError('Dieser Zugang ist nur für Barbershops.')
      await supabase.auth.signOut()
      return
    }

    navigate('/barber')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Barbershop-Login</h1>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
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
          <button type="submit" className={styles.button}>
            Einloggen
          </button>
        </form>
        <div className={styles.footer}>
          Kein Barbershop? <Link to="/login/customer">Kunden-Login</Link>
        </div>
      </div>
    </div>
  )
}
