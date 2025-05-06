// services/supabase/client.js
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'  // zieht die .env-Variablen in process.env

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '❌ SUPABASE_URL oder SUPABASE_ANON_KEY fehlt. Bitte .env anlegen und Werte setzen.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)
