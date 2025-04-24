import { supabase } from '../../supabaseClient.js'

export async function fetchAppointments() {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')

  if (error) console.error('Fehler beim Abrufen:', error.message)
  else console.log('Appointments:', data)
}