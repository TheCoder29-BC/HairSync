// backend/routes/appointmentsRoutes.js
import express from 'express'
import { getAppointments, createAppointment, cancelAppointment } from '../controllers/appointmentsController.js'
import { authenticateToken } from '../../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authenticateToken, getAppointments)
router.post('/', authenticateToken, createAppointment)
router.delete('/:id', authenticateToken, cancelAppointment)

export default router
