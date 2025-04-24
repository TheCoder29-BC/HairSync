import { supabase } from '../supabase/client.js'

export async function getAppointments(req, res) {
  const userId = req.user.id

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId) // ❗️angepasst

  if (error) return res.status(400).json({ error: error.message })

  res.json(data)
}

export async function createAppointment(req, res) {
  const { appointment_time, barber_id, service_id } = req.body
  const user_id = req.user.id // ❗️angepasst

  if (!appointment_time || !barber_id || !service_id) {
    return res.status(400).json({ error: 'Alle Felder sind erforderlich' })
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert([{ appointment_time, barber_id, service_id, user_id }]) // ❗️angepasst
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  res.status(201).json(data)
}
