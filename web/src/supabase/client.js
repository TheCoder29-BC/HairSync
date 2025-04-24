import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qashdjhkekwbadfnkffj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhc2hkamhrZWt3YmFkZm5rZmZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTMxODQ4NSwiZXhwIjoyMDYwODk0NDg1fQ.mQ1Alt3ddyxKoGw82QMgf9vnss78NobAjVgeB4cu6iw'

export const supabase = createClient(supabaseUrl, supabaseKey)