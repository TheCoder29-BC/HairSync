import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://qashdjhkekwbadfnkffj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhc2hkamhrZWt3YmFkZm5rZmZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTMxODQ4NSwiZXhwIjoyMDYwODk0NDg1fQ.mQ1Alt3ddyxKoGw82QMgf9vnss78NobAjVgeB4cu6iw'
)

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    console.warn('🔒 Kein Token im Header')
    return res.status(401).json({ error: 'Kein Token übergeben' })
  }

  try {
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      console.warn('⛔️ Ungültiger oder abgelaufener Token')
      return res.status(403).json({ error: 'Token ungültig oder Zugriff verweigert' })
    }

    req.user = data.user
    next()
  } catch (err) {
    console.error('❌ Fehler beim Verifizieren:', err)
    return res.status(500).json({ error: 'Fehler bei der Tokenprüfung' })
  }
}
