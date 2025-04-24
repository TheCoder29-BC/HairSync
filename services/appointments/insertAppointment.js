import { supabase } from '../../supabaseClient.js'

export async function insertAppointment(appointment) {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointment])

  if (error) console.error('Fehler beim Einfügen:', error.message)
  else console.log('Termin hinzugefügt:', data)
}