// src/pages/Register.jsx
import React, { useState } from 'react'
import { supabase } from '../supabase/client.js'
import { useNavigate } from 'react-router-dom'
import styles from './Login.module.css'

export default function Register() {
  const [firstName, setFirstName]   = useState('')
  const [lastName, setLastName]     = useState('')
  const [email, setEmail]           = useState('')
  const [phone, setPhone]           = useState('')
  const [street, setStreet]         = useState('')
  const [city, setCity]             = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [error, setError]           = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwörter stimmen nicht überein.')
      return
    }

    // V2-Syntax: options.data
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: 'customer' } }
    })
    if (signUpError) {
      setError(signUpError.message)
      return
    }

    // Profil anlegen
    const userId = signUpData.user.id
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id:           userId,
        first_name:   firstName,
        last_name:    lastName,
        phone,
        street,
        city,
        postal_code:  postalCode
      }])
    if (profileError) {
      setError(profileError.message)
      return
    }

    navigate('/login')
  }

  return (
    <div className={styles.container}>
      <form
        onSubmit={handleSubmit}
        className={styles.card}
        style={{ width: '90%', maxWidth: '600px' }}
      >
        <h2 className={styles.title}>Als Kunde registrieren</h2>

        {error && <p className={styles.error}>{error}</p>}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem 2rem'
          }}
        >
          <div className={styles.field}>
            <label>Vorname</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Nachname</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
            />
          </div>
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
            <label>Telefon</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Straße</label>
            <input
              type="text"
              value={street}
              onChange={e => setStreet(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Stadt</label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Postleitzahl</label>
            <input
              type="text"
              value={postalCode}
              onChange={e => setPostalCode(e.target.value)}
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
          <div className={styles.field}>
            <label>Passwort bestätigen</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className={styles.button}>
          Registrieren
        </button>

        <div className={styles.footer}>
          Schon registriert? <a href="/login">Einloggen</a><br />
          Barbershop? <a href="/register-barbershop">Jetzt registrieren</a>
        </div>
      </form>
    </div>
  )
}
