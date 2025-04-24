import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://qashdjhkekwbadfnkffj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhc2hkamhrZWt3YmFkZm5rZmZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTMxODQ4NSwiZXhwIjoyMDYwODk0NDg1fQ.mQ1Alt3ddyxKoGw82QMgf9vnss78NobAjVgeB4cu6iw'
)

export async function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.sendStatus(401)

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) return res.sendStatus(403)

  req.user = data.user
  next()
}