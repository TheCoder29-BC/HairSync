// backend/server.js

import express from 'express'
import cors from 'cors'

// Routen-Importe
import authRoutes from './routes/authRoutes.js'
import appointmentRoutes from './routes/appointmentsRoutes.js'
import serviceRoutes from './routes/serviceRoutes.js'
import barberRoutes from './routes/barberRoutes.js'
import barbershopsRoutes from './routes/barbershopsRoutes.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routen
app.use('/api/auth', authRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/barbers', barberRoutes)
app.use('/api/barbershops', barbershopsRoutes)

// Server starten
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`✅ Backend läuft auf Port ${PORT}`)
})
