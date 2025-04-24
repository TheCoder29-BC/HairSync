import { supabase } from '../../supabaseClient.js'

export async function fetchUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')

  if (error) console.error('Fehler beim Abrufen der Nutzer:', error.message)
  else console.log('Nutzer:', data)
}