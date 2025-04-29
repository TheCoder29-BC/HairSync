// web/src/services/appointmentsService.js
import { supabase } from '../supabase/client.js' // Pfad auf web/src/supabase/client.js

/**
 * Holt alle Termine für den gegebenen Benutzer (user_id muss eine UUID sein)
 * @param {string} user_id
 * @returns {Array} Array von Termin-Objekten oder leeres Array bei Fehler
 */
export async function fetchAppointments(user_id) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', user_id)

  if (error) {
    console.error('Fehler beim Abrufen der Termine:', error.message)
    return []
  }
  console.log('Appointments:', data)
  return data
}

/**
 * Erstellt einen neuen Termin.
 * @param {Object} appointment  { user_id, barber_id, service_id, appointment_time, status }
 * @returns {Object} Das neu angelegte Termin-Objekt oder { error }
 */
export async function createAppointment(appointment) {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointment])
    .select()
    .single()

  if (error) {
    console.error('Fehler beim Erstellen des Termins:', error.message)
    return { error: error.message }
  }
  console.log('Neuer Termin erstellt:', data)
  return data
}

/**
 * Storniert einen Termin per ID.
 * @param {string|number} id
 * @returns {Object} Das gelöschte Termin-Objekt oder { error }
 */
export async function cancelAppointment(id) {
  // .single() entfernt, wir erwarten jetzt ein Array von gelöschten Zeilen
  const { data, error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)
    .select()

  if (error) {
    console.error('Fehler beim Stornieren des Termins:', error.message)
    return { error: error.message }
  }

  // Wurde kein Termin gelöscht?
  if (!data || data.length === 0) {
    const msg = `Kein Termin mit id=${id} gefunden.`
    console.warn(msg)
    return { error: msg }
  }

  // Normalfall: genau ein gelöschter Termin
  const deleted = data[0]
  console.log('Termin erfolgreich storniert:', deleted)
  return deleted
}
