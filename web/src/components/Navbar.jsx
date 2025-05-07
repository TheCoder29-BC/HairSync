// web/src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation }    from 'react-router-dom'
import { useAuth }                           from '../context/AuthContext.jsx'
import { supabase }                          from '../supabase/client.js'
import { fetchUnreadCount }                  from '../services/chatService.js'
import { useTranslation }                    from 'react-i18next'
import styles                                from './Navbar.module.css'

export default function Navbar() {
  const { t, i18n }         = useTranslation()
  const { session, logout } = useAuth()
  const navigate            = useNavigate()
  const { pathname }        = useLocation()

  const profileRef = useRef()
  const langRef    = useRef()
  const notificationSound = useRef(null)

  const [profileOpen, setProfileOpen] = useState(false)
  const [langOpen, setLangOpen]       = useState(false)
  const [shopLogo, setShopLogo]       = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const role   = session?.user?.user_metadata?.role
  const userId = session?.user?.id

  // Sign-Out
  const handleSignOut = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  // Klick-außerhalb-Handler
  useEffect(() => {
    function onClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Audio preload
  useEffect(() => {
    notificationSound.current = new Audio('/sounds/notify.mp3')
    notificationSound.current.load()

    // Unlock audio on first user click anywhere
    const unlockAudio = () => {
      notificationSound.current
        .play()
        .then(() => {
          notificationSound.current.pause()
          notificationSound.current.currentTime = 0
        })
        .catch(() => {})
      document.removeEventListener('click', unlockAudio)
    }
    document.addEventListener('click', unlockAudio, { once: true })
  }, [])

  // Supabase-Subscription & Badge laden
  useEffect(() => {
    if (!session) return

    // initial load
    const loadUnread = async () => {
      try {
        const count = await fetchUnreadCount()
        setUnreadCount(count)
      } catch (err) {
        console.error('Error loading unread count:', err)
      }
    }
    loadUnread()

    // realtime channel
    const channel = supabase
      .channel('navbar-unread')
      // 1) neue fremde Nachrichten
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${userId}`
        },
        () => {
          loadUnread()
          notificationSound.current?.play().catch(() => {})
        }
      )
      // 2) every conversation update
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          loadUnread()
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [session, userId])

  // Shop-Logo laden
  useEffect(() => {
    if (session && role === 'barbershop') {
      ;(async () => {
        const { data, error } = await supabase
          .from('barbershops')
          .select('logo_url')
          .eq('owner_user_id', userId)
          .maybeSingle()
        if (!error && data?.logo_url) {
          setShopLogo(data.logo_url)
        }
      })()
    }
  }, [session, role, userId])

  // Sprachwechsel
  const languages = ['de', 'en', 'tr']
  const switchLanguage = lng => {
    i18n.changeLanguage(lng)
    setLangOpen(false)
  }

  return (
    <nav className={styles.navbar}>
      <Link to='/' className={styles.logo}>{t('app_name')}</Link>

      <div className={styles.right}>
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
            <Link
              to='/conversations'
              className={`${styles.link} ${pathname.startsWith('/conversations') ? styles.active : ''}`}
            >
              {t('chat')}
              {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
            </Link>
          </>
        )}

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
            <Link
              to='/conversations'
              className={`${styles.link} ${pathname.startsWith('/conversations') ? styles.active : ''}`}
            >
              {t('chat')}
              {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
            </Link>
          </>
        )}

        {/* Sprachwahl */}
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
                  <img src={`/flags/${lng}.svg`} alt={t(`language_${lng}`)} className={styles.flagIcon} />
                  <span>{t(`language_${lng}`)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Profil-Dropdown */}
        {session && (
          <div className={styles.profile} ref={profileRef}>
            <button className={styles.iconButton} onClick={() => setProfileOpen(o => !o)}>
              {role === 'barbershop' && shopLogo
                ? <img src={shopLogo} alt={t('logo_alt')} className={styles.avatar} />
                : (
                  <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M5.121 17.804A10.97 10.97 0 0112 15c2.385 0 
                         4.58.78 6.379 2.093M15 11a3 3 0 
                         11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )
              }
            </button>
            {profileOpen && (
              <div className={`${styles.dropdown} animate-fade-in`}>
                <p className={styles.dropdownItem}>
                  {t('logged_in_as')}<br /><strong>{session.user.email}</strong>
                </p>
                {role === 'customer' && (
                  <Link
                    to='/profile'
                    className={styles.dropdownItem}
                    onClick={() => setProfileOpen(false)}
                  >
                    {t('profile')}
                  </Link>
                )}
                <button
                  className={`${styles.dropdownItem} ${styles.signOut}`}
                  onClick={handleSignOut}
                >
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
