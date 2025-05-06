// services/appointments/insertAppointment.js
import { supabase } from '../supabase/client.js'

export async function insertAppointment(appt) {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appt)
  if (error) throw new Error(error.message)
  return data
}
