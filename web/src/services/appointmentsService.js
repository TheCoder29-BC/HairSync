// src/services/appointmentsService.js
import { supabase } from '../supabaseClient.js'

export async function fetchAppointments(token) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', token) // Falls du Termine für einen spezifischen User holen möchtest

  if (error) {
    console.error('Fehler beim Abrufen:', error.message)
    return [] // Gibt eine leere Liste zurück, wenn ein Fehler auftritt
  }

  console.log('Appointments:', data)
  return data
}

export async function createAppointment(appointment, token) {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointment])

  if (error) {
    console.error('Fehler beim Erstellen des Termins:', error.message)
    return { error: error.message }
  }

  return data
}

export async function cancelAppointment(id, token) {
  const { data, error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Fehler beim Stornieren des Termins:', error.message)
    return { error: error.message }
  }

  return data
}
