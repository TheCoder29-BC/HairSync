// backend/controllers/appointmentsController.js
import { supabase } from '../supabase/client.js'

// Alle Termine des eingeloggten Nutzers abrufen
export async function getAppointments(req, res) {
  const userId = req.user.id

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('customer_id', userId)

  if (error) return res.status(400).json({ error: error.message })

  res.json(data)
}

// Neuen Termin erstellen
export async function createAppointment(req, res) {
  const { appointment_time, barber_id, service_id } = req.body
  const customer_id = req.user.id

  if (!appointment_time || !barber_id || !service_id) {
    return res.status(400).json({ error: 'Alle Felder sind erforderlich' })
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert([{ appointment_time, barber_id, service_id, customer_id }])
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  res.status(201).json(data)
}

// Termin stornieren
export async function cancelAppointment(req, res) {
  const { id } = req.params
  const userId = req.user.id

  const { error } = await supabase
    .from('appointments')
    .delete()
    .match({ id, customer_id: userId })

  if (error) return res.status(400).json({ error: error.message })

  res.status(200).json({ message: 'Termin erfolgreich storniert' })
}
