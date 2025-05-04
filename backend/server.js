import express from 'express'
import cors from 'cors'

import authRoutes from './routes/authRoutes.js'  


const app = express()
app.use(cors())
app.use(express.json())


app.use('/api/auth', authRoutes)  


app.listen(4000, () => {
  console.log('✅ Backend läuft auf Port 4000')
})
