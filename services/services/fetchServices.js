import { supabase } from '../../supabaseClient.js'

export async function fetchServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')

  if (error) console.error('Fehler beim Abrufen der Services:', error.message)
  else console.log('Services:', data)
}