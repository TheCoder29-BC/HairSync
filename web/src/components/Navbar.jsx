import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation }    from 'react-router-dom'
import { useAuth }                           from '../context/AuthContext.jsx'
import { supabase }                          from '../supabase/client.js'
import { useTranslation }                    from 'react-i18next'
import styles                                from './Navbar.module.css'

export default function Navbar() {
  const { t, i18n }         = useTranslation()
  const { session, logout } = useAuth()
  const navigate            = useNavigate()
  const { pathname }        = useLocation()

  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef                    = useRef()

  const [shopLogo, setShopLogo] = useState(null)

  // Klick außerhalb schließt Dropdowns
  useEffect(() => {
    function onClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const role = session?.user?.user_metadata?.role

  // Shop-Logo laden
  useEffect(() => {
    if (session && role === 'barbershop') {
      ;(async () => {
        const { data, error } = await supabase
          .from('barbershops')
          .select('logo_url')
          .eq('owner_user_id', session.user.id)
          .maybeSingle()
        if (!error && data?.logo_url) setShopLogo(data.logo_url)
      })()
    }
  }, [session, role])

  const handleSignOut = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const languages = ['de', 'en', 'tr']
  const [langOpen, setLangOpen] = useState(false)
  const langRef                 = useRef()

  const switchLanguage = lng => {
    i18n.changeLanguage(lng)
    setLangOpen(false)
  }

  return (
    <nav className={styles.navbar}>
      <Link to='/' className={styles.logo}>
        {t('app_name')}
      </Link>

      <div className={styles.right}>
        {/* — Kunden-Links — */}
        {session && role === 'customer' && (
          <>
            <Link
              to='/barbershops'
              className={`${styles.link} ${pathname.startsWith('/barbershops') ? styles.active : ''}`}
            >
              {t('barbershops')}
            </Link>
            <Link
              to='/appointments'
              className={`${styles.link} ${pathname.startsWith('/appointments') ? styles.active : ''}`}
            >
              {t('my_appointments')}
            </Link>
            {/* Chat-Link für Kunden */}
            <Link
              to='/conversations'
              className={`${styles.link} ${pathname.startsWith('/conversations') ? styles.active : ''}`}
            >
              {t('chat')}
            </Link>
          </>
        )}

        {/* — Barbershop-Links — */}
        {session && role === 'barbershop' && (
          <>
            <Link
              to='/barbershop-dashboard'
              className={`${styles.link} ${pathname.startsWith('/barbershop-dashboard') ? styles.active : ''}`}
            >
              {t('dashboard')}
            </Link>
            <Link
              to='/shop-appointments'
              className={`${styles.link} ${pathname.startsWith('/shop-appointments') ? styles.active : ''}`}
            >
              {t('appointments')}
            </Link>
            <Link
              to='/barbershop-schedule'
              className={`${styles.link} ${pathname.startsWith('/barbershop-schedule') ? styles.active : ''}`}
            >
              {t('schedule')}
            </Link>
            {/* Chat-Link für Barbershop */}
            <Link
              to='/conversations'
              className={`${styles.link} ${pathname.startsWith('/conversations') ? styles.active : ''}`}
            >
              {t('chat')}
            </Link>
          </>
        )}

        {/* — Sprachwahl: FLAGGE — */}
        <div className={styles.flagWrapper} ref={langRef}>
          <button className={styles.flagButton} onClick={() => setLangOpen(o => !o)}>
            <img
              src={`/flags/${i18n.language}.svg`}
              alt={t(`language_${i18n.language}`)}
              className={styles.flagIcon}
            />
          </button>
          {langOpen && (
            <div className={styles.flagDropdown}>
              {languages.map(lng => (
                <button
                  key={lng}
                  className={styles.flagItem}
                  onClick={() => switchLanguage(lng)}
                >
                  <img
                    src={`/flags/${lng}.svg`}
                    alt={t(`language_${lng}`)}
                    className={styles.flagIcon}
                  />
                  <span>{t(`language_${lng}`)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* — Profil (Avatar/Icon + Dropdown) — */}
        {session && (
          <div className={styles.profile} ref={profileRef}>
            <button className={styles.iconButton} onClick={() => setProfileOpen(o => !o)}>
              {role === 'barbershop' && shopLogo ? (
                <img src={shopLogo} alt={t('logo_alt')} className={styles.avatar} />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A10.97 10.97 0 0112 15c2.385 0 4.58.78 6.379 2.093M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
            {profileOpen && (
              <div className={`${styles.dropdown} animate-fade-in`}>
                <p className={styles.dropdownItem}>
                  {t('logged_in_as')}<br/>
                  <strong>{session.user.email}</strong>
                </p>
                {role === 'customer' && (
                  <Link to='/profile' className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>
                    {t('profile')}
                  </Link>
                )}
                <button className={`${styles.dropdownItem} ${styles.signOut}`} onClick={handleSignOut}>
                  {t('sign_out')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
