import { supabase } from '../supabase/client.js'

// Registrierung
export async function registerUser(req, res) {
  try {
    const { email, password } = req.body
    console.log('📥 Neue Registrierung:', email)

    if (!email || !password) {
      return res.status(400).json({ error: 'Email und Passwort sind erforderlich' })
    }

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      console.error('❌ Supabase-Fehler bei Registrierung:', error.message)
      return res.status(400).json({ error: error.message })
    }

    console.log('✅ Benutzer registriert:', data.user?.email || 'Unbekannt')

    // Optional: sofort einloggen nach Registrierung
    const loginResult = await supabase.auth.signInWithPassword({ email, password })
    if (loginResult.error) {
      return res.status(200).json({ user: data.user }) // fallback: nur user zurück
    }

    return res.status(200).json({
      user: loginResult.data.user,
      access_token: loginResult.data.session.access_token,
      refresh_token: loginResult.data.session.refresh_token
    })

  } catch (err) {
    console.error('🔥 Serverfehler bei Registrierung:', err.message)
    return res.status(500).json({ error: 'Serverfehler bei der Registrierung' })
  }
}

// Login
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body
    console.log('🔐 Login-Versuch:', email)

    if (!email || !password) {
      return res.status(400).json({ error: 'Email und Passwort sind erforderlich' })
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.error('❌ Supabase-Fehler beim Login:', error.message)
      return res.status(401).json({ error: error.message })
    }

    console.log('✅ Login erfolgreich:', data.user.email)

    return res.status(200).json({
      user: data.user,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    })

  } catch (err) {
    console.error('🔥 Serverfehler beim Login:', err.message)
    return res.status(500).json({ error: 'Serverfehler beim Login' })
  }
}
