import { supabase } from '../../supabaseClient.js'

export async function insertService(service) {
  const { data, error } = await supabase
    .from('services')
    .insert([service])

  if (error) console.error('Fehler beim Hinzufügen des Services:', error.message)
  else console.log('Service hinzugefügt:', data)
}