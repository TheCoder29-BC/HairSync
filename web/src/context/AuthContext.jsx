import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase/client.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )
    return () => listener.subscription.unsubscribe()
  }, [])

  // ** Hier ist unser Login-Wrapper: **
  const login = (email, password) => {
    return supabase.auth.signInWithPassword({ email, password })
  }

  const logout = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
