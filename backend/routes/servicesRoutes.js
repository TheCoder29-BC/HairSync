// backend/routes/serviceRoutes.js

import express from 'express'
import { getServices } from '../controllers/servicesController.js'

const router = express.Router()

// Route: GET /api/services
router.get('/', getServices)

export default router