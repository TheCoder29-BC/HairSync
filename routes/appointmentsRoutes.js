import express from 'express'
import { getAppointments, createAppointment } from '../controllers/appointmentsController.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/appointments', verifyToken, getAppointments)
router.post('/appointments', verifyToken, createAppointment)

export default router