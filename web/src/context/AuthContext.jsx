import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase/client.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  // undefined = noch keine Info (Loading), null = nicht eingeloggt, Objekt = Session
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    // beim Start Session laden
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    // auf Auth-Changes hören
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const login = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const logout = () =>
    supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
