import { supabase } from '../../supabaseClient.js'

export async function fetchBarbers() {
  const { data, error } = await supabase
    .from('barbers')
    .select('*')

  if (error) console.error('Fehler beim Abrufen der Friseure:', error.message)
  else console.log('Friseure:', data)
}