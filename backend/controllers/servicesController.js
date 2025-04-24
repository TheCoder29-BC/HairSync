// backend/controllers/servicesController.js

import { supabase } from '../supabase/client.js'

// GET /api/services
export async function getServices(req, res) {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true }) // optional: sortiert nach Name

    if (error) {
      console.error('Fehler beim Abrufen der Services:', error.message)
      return res.status(500).json({ error: 'Fehler beim Abrufen der Services' })
    }

    res.json(data)
  } catch (err) {
    console.error('Unerwarteter Fehler:', err)
    res.status(500).json({ error: 'Unerwarteter Serverfehler' })
  }
}
