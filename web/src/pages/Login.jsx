import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './Login.module.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    const { data, error } = await login(email, password)
    if (error) {
      setError(error.message)
    } else {
      // Rolle auslesen
      const role = data.user.user_metadata.role
      if (role === 'customer') {
        navigate('/appointments')
      } else {
        navigate('/barber')
      }
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
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label>Passwort</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className={styles.button} type="submit">Einloggen</button>
        <div className={styles.footer}>
          Noch kein Konto? <a href="/register">Kunde registrieren</a><br />
          Barbershop? <a href="/register-barbershop">Jetzt registrieren</a>
        </div>
      </form>
    </div>
  )
}
