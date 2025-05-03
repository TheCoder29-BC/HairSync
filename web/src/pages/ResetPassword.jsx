// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase }                    from '../supabase/client.js'
import styles                          from './ResetPassword.module.css'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)

  useEffect(() => {
    const token = searchParams.get('access_token')
    if (token) {
      supabase.auth.setAuth(token)
    } else {
      navigate('/login')
    }
  }, [])

  const handleUpdate = async e => {
    e.preventDefault()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else       navigate('/login')
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleUpdate} className={styles.card}>
        <h2 className={styles.title}>Neues Passwort</h2>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.field}>
          <label>Neues Passwort</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.button}>
          Passwort setzen
        </button>
      </form>
    </div>
  )
}
