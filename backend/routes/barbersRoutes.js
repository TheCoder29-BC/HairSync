// backend/routes/barbersRoutes.js
import express from 'express'
import { supabase } from '../supabase/client.js'

const router = express.Router()

// GET /api/barbers
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('barbers')
    .select('id, full_name, barbershop_id')  // passe Spalten nach Bedarf an

  if (error) {
    console.error('Fehler beim Abrufen der Barbers:', error.message)
    return res.status(400).json({ error: error.message })
  }
  res.json(data)
})

export default router
