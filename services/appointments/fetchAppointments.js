import { supabase } from '../supabase/client.js'

export async function fetchAppointments(user_id) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', user_id) // Holen der Termine für einen spezifischen Benutzer

  if (error) {
    console.error('Fehler beim Abrufen:', error.message)
    return [] // Gibt eine leere Liste zurück, wenn ein Fehler auftritt
  }

  console.log('Appointments:', data)
  return data
}
