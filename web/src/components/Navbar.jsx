// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation }     from 'react-router-dom'
import { useAuth }                            from '../context/AuthContext.jsx'
import styles                                 from './Navbar.module.css'

export default function Navbar() {
  const { session, logout } = useAuth()
  const navigate            = useNavigate()
  const { pathname }        = useLocation()
  const [open, setOpen]     = useState(false)
  const dropdownRef         = useRef()

  // Klick außerhalb = Dropdown schließen
  useEffect(() => {
    function onClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleSignOut = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  // Rolle auslesen
  const role = session?.user?.user_metadata?.role

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logo} style={{ fontFamily: 'inherit' }}>
        HairSync
      </Link>

      <div className={styles.right}>
        {/* --- Kunde-Links --- */}
        {session && role === 'customer' && (
          <>
            <Link
              to="/barbershops"
              className={`${styles.link} ${
                pathname.startsWith('/barbershops') ? styles.active : ''
              }`}
            >
              Barbershops
            </Link>
            <Link
              to="/appointments"
              className={`${styles.link} ${
                pathname.startsWith('/appointments') ? styles.active : ''
              }`}
            >
              Meine Termine
            </Link>
          </>
        )}

        {/* --- Barbershop-Links --- */}
        {session && role === 'barbershop' && (
          <>
            <Link
              to="/barbershop-dashboard"
              className={`${styles.link} ${
                pathname.startsWith('/barbershop-dashboard') ? styles.active : ''
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/shop-appointments"
              className={`${styles.link} ${
                pathname.startsWith('/shop-appointments') ? styles.active : ''
              }`}
            >
              Termine
            </Link>
          </>
        )}

        {/* --- Profil-Dropdown --- */}
        {session && (
          <div className={styles.profile} ref={dropdownRef}>
            <button
              className={styles.iconButton}
              onClick={() => setOpen(o => !o)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.icon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.121 17.804A10.97 10.97 0 0112 15c2.385 0 4.58.78 
                     6.379 2.093M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {open && (
              <div className={`${styles.dropdown} animate-fade-in`}>
                <p className={styles.dropdownItem}>
                  Eingeloggt als<br/>
                  <strong>{session.user.email}</strong>
                </p>

                {/* Profil-Link nur für Kunden */}
                {role === 'customer' && (
                  <Link
                    to="/profile"
                    className={styles.dropdownItem}
                    onClick={() => setOpen(false)}
                  >
                    Profil
                  </Link>
                )}

                <button
                  className={`${styles.dropdownItem} ${styles.signOut}`}
                  onClick={handleSignOut}
                >
                  Abmelden
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
