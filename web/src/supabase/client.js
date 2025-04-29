// web/src/supabase/client.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qashdjhkekwbadfnkffj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhc2hkamhrZWt3YmFkZm5rZmZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMTg0ODUsImV4cCI6MjA2MDg5NDQ4NX0.xsR-mTbZJNPoLEFLSkT_yvDKlOg7L0uDW6A9w4YOV9c'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      // Session in localStorage speichern
      persistSession: true,
      // Token automatisch erneuern
      autoRefreshToken: true,
      // Query-Params bei Redirects parsen (Magic Link, OAuth, …)
      detectSessionInUrl: true,
    },
  }
)
