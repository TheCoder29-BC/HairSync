import { supabase } from '../supabase/client.js'

export async function deleteAppointment(id) {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)

  if (error) console.error('Fehler beim Löschen:', error.message)
  else console.log('Termin gelöscht:', id)
}