import { supabase } from '../supabase/client.js'

export async function insertBarber(barber) {
  const { data, error } = await supabase
    .from('barbers')
    .insert([barber])

  if (error) console.error('Fehler beim Hinzufügen des Friseurs:', error.message)
  else console.log('Friseur hinzugefügt:', data)
}