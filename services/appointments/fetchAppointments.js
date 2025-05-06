// services/appointments/fetchAppointments.js
import { supabase } from '../supabase/client.js'

export async function fetchAppointments() {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
  if (error) throw new Error(error.message)
  return data
}
