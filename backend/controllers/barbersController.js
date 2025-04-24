// backend/controllers/barbersController.js

import { supabase } from '../supabase/client.js'

// GET /api/barbers
export async function getBarbers(req, res) {
  try {
    const { data, error } = await supabase
      .from('barbers')
      .select('id, full_name')
      .order('full_name', { ascending: true })

    if (error) {
      console.error('❌ Fehler beim Abrufen der Barbers:', error.message)
      return res.status(500).json({ error: 'Fehler beim Abrufen der Barbers' })
    }

    res.json(data)
  } catch (err) {
    console.error('🔥 Unerwarteter Fehler:', err)
    res.status(500).json({ error: 'Serverfehler beim Abrufen der Barbers' })
  }
}
