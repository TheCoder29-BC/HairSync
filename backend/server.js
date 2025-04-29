// Beispiel: server.js im Backend
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/authRoutes.js'  // <-- wichtig
// ... andere Imports

const app = express()
app.use(cors())
app.use(express.json())

// Routen einbinden
app.use('/api/auth', authRoutes)  // <-- das brauchst du

// Server starten
app.listen(4000, () => {
  console.log('✅ Backend läuft auf Port 4000')
})
