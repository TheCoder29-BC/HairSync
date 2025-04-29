// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { session, logout } = useAuth();
  const loc         = useLocation();
  const navigate    = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const linkBaseStyle = {
    color: 'black',
    textDecoration: 'none',
    fontWeight: 500,
    transition: 'color 150ms, text-decoration 150ms',
  };

  const activeStyle = {
    color: '#4F46E5',
    textDecoration: 'underline',
  };

  const toggleDropdown = () => setDropdownOpen(o => !o);
  const handleLogout  = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      borderBottom: '1px solid #eee',
      backgroundColor: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <Link to="/barbershops" style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        textDecoration: 'none',
        color: '#4F46E5',
      }}>
        HairSync
      </Link>

      {/* Nur anzeigen, wenn eingeloggt */}
      {session && (
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', position: 'relative' }}>
          <Link
            to="/barbershops"
            style={{
              ...linkBaseStyle,
              ...(loc.pathname.startsWith('/barbershops') ? activeStyle : {}),
            }}
          >
            Barbershops
          </Link>

          <Link
            to="/appointments"
            style={{
              ...linkBaseStyle,
              ...(loc.pathname === '/appointments' ? activeStyle : {}),
            }}
          >
            Meine Termine
          </Link>

          {/* User-Icon + Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={toggleDropdown}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ height: '2rem', width: '2rem', color: '#374151' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M5.121 17.804A9.953 9.953 0 0112 15c2.21 0 4.249.716 5.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '2.5rem',
                right: 0,
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                minWidth: '12rem',
                zIndex: 100,
                animation: 'fadeIn 0.2s ease-in-out',
              }}>
                {/* Eingeloggt–Status */}
                <div style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #e5e7eb',
                  color: '#4b5563',
                  fontSize: '0.875rem',
                }}>
                  Eingeloggt als:<br/>
                  <strong style={{ color: '#111827' }}>
                    {session.user.email}
                  </strong>
                </div>

                <button
                  onClick={() => {
                    navigate('/profile');
                    setDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '1rem',
                    color: '#111827',
                    cursor: 'pointer',
                  }}
                >
                  Mein Profil
                </button>

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '1rem',
                    color: 'crimson',
                    cursor: 'pointer',
                  }}
                >
                  Abmelden
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
