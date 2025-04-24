// backend/routes/barbershopsRoutes.js
import express from 'express'
import { getBarbershops, getBarbersByShop } from '../controllers/barbershopsController.js'

const router = express.Router()

// GET /api/barbershops
router.get('/', getBarbershops)

// GET /api/barbershops/:id/barbers
router.get('/:id/barbers', getBarbersByShop)

export default router
