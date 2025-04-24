// backend/routes/barberRoutes.js

import express from 'express'
import { getBarbers } from '../controllers/barbersController.js'

const router = express.Router()

// Route: GET /api/barbers
router.get('/', getBarbers)

export default router
