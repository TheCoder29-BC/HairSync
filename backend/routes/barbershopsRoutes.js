import express from 'express'
import { supabase } from '../supabase/client.js'

const router = express.Router()

// GET /api/barbershops
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('barbershops')
    .select('id, name')
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

export default router
