// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (data?.session?.user) {
        setUser({
          user: data.session.user,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        })
        localStorage.setItem('user', JSON.stringify({
          user: data.session.user,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        }))
      } else {
        localStorage.removeItem('user')
        setUser(null)
      }
    }

    checkSession()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        const newUser = {
          user: session.user,
          access_token: session.access_token,
          refresh_token: session.refresh_token
        }
        setUser(newUser)
        localStorage.setItem('user', JSON.stringify(newUser))
      } else {
        setUser(null)
        localStorage.removeItem('user')
        setNotice('🔒 Deine Sitzung ist abgelaufen. Bitte logge dich erneut ein.')
        navigate('/login')
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const login = (userData) => {
    setUser(userData)
    setNotice('')
    localStorage.setItem('user', JSON.stringify(userData))
    navigate('/dashboard')
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user, notice }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
