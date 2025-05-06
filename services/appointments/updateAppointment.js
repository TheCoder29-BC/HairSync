import { supabase } from '../supabase/client.js'

export async function updateAppointment(id, updates) {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)

  if (error) console.error('Fehler beim Aktualisieren:', error.message)
  else console.log('Termin aktualisiert:', data)
}