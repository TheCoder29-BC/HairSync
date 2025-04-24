import { supabase } from '../../supabaseClient.js'

export async function insertUser(user) {
  const { data, error } = await supabase
    .from('users')
    .insert([user])

  if (error) console.error('Fehler beim Einfügen des Nutzers:', error.message)
  else console.log('Nutzer hinzugefügt:', data)
}