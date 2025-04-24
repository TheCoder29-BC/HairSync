import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import appointmentsRoutes from './routes/appointmentsRoutes.js' // ← hinzugefügt

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api', appointmentsRoutes) // ← hinzugefügt

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`✅ Backend läuft auf Port ${PORT}`)
})
