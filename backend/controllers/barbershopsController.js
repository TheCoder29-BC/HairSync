// backend/controllers/barbershopsController.js
import { supabase } from '../supabase/client.js'

// GET /api/barbershops
export async function getBarbershops(req, res) {
  const { data, error } = await supabase
    .from('barbershops')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('❌ Fehler beim Abrufen der Barbershops:', error.message)
    return res.status(500).json({ error: 'Fehler beim Abrufen der Barbershops' })
  }

  res.json(data)
}

// GET /api/barbershops/:id/barbers
export async function getBarbersByShop(req, res) {
  const { id } = req.params

  const { data, error } = await supabase
    .from('barbers')
    .select('id, full_name')
    .eq('barbershop_id', id)

  if (error) {
    console.error('❌ Fehler beim Abrufen der Barbers:', error.message)
    return res.status(500).json({ error: 'Fehler beim Abrufen der Barbers' })
  }

  res.json(data)
}
