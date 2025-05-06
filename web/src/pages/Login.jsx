// src/pages/Login.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate }         from 'react-router-dom'
import { useAuth }                   from '../context/AuthContext.jsx'
import { useTranslation }            from 'react-i18next'
import styles                        from './Login.module.css'

export default function Login() {
  const { t }            = useTranslation()
  const { session, login, logout } = useAuth()
  const navigate         = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  // wenn schon eingeloggt → direkt zum Dashboard
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

    const role = data.session?.user?.user_metadata?.role
    if (role === 'customer') {
      navigate('/barbershops', { replace: true })
    } else if (role === 'barbershop') {
      navigate('/barbershop-dashboard', { replace: true })
    } else {
      setError(t('unknown_role'))
      await logout()
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleLogin} className={styles.card}>
        <h2 className={styles.title}>{t('login')}</h2>
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.field}>
          <label htmlFor="email">{t('email')}</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('enter_email')}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">{t('password')}</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t('enter_password')}
            required
          />
        </div>

        <p className={styles.forgot}>
          <Link to="/forgot-password" className={styles.link}>
            {t('forgot_password')}?
          </Link>
        </p>

        <button type="submit" className={styles.button}>
          {t('login_button')}
        </button>

        <div className={styles.footer}>
          {t('no_account')} <Link to="/register" className={styles.link}>{t('register_customer')}</Link>
          <br/>
          {t('is_shop')} <Link to="/register-barbershop" className={styles.link}>{t('register_shop')}</Link>
        </div>
      </form>
    </div>
  )
}
