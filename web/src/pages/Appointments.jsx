import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchAppointments, createAppointment } from '../services/appointmentsService'

export default function Appointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ date: '', time: '', barber_id: 1, service_id: 1 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!user || !user.access_token) {
        console.warn('⚠️ Kein Token vorhanden – warte auf Login...')
        setMessage('Nicht eingeloggt oder kein Token gefunden.')
        setLoading(false)
        return
      }

      console.log('🔐 Token vorhanden, lade Termine:', user.access_token)

      try {
        const data = await fetchAppointments(user.access_token)

        if (!Array.isArray(data)) {
          console.error('❌ Unerwartete Antwort:', data)
          setMessage('Fehler beim Laden der Termine.')
        } else {
          setAppointments(data)
        }
      } catch (err) {
        console.error('❌ Fehler beim Laden:', err)
        setMessage('Fehler beim Laden der Termine.')
      }

      setLoading(false)
    }

    load()
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user || !user.access_token) {
      setMessage('Nicht eingeloggt oder kein Token gefunden.')
      return
    }

    const userId = user.user?.id || user.id

    const appointment = {
      ...form,
      user_id: userId, // ✅ angepasst für deine Tabelle
      appointment_time: `${form.date}T${form.time}`,
      status: 'confirmed' // falls du es setzen willst
    }

    console.log('📨 Termin senden:', appointment)

    try {
      const result = await createAppointment(appointment, user.access_token)

      if (result.error) {
        setMessage(`❌ Fehler: ${result.error}`)
      } else {
        setMessage('✅ Termin erfolgreich erstellt')
        setAppointments([...appointments, result])
      }

    } catch (err) {
      console.error('❌ Fehler beim Erstellen:', err)
      setMessage('Fehler beim Erstellen des Termins.')
    }
  }

  if (loading) {
    return <p style={{ color: 'orange' }}>🔄 Lade Benutzerdaten...</p>
  }

  return (
    <div>
      <h2>Termine</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="date"
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
          required
        />
        <input
          type="time"
          value={form.time}
          onChange={e => setForm({ ...form, time: e.target.value })}
          required
        />
        <button type="submit">Termin buchen</button>
      </form>

      {message && <p style={{ color: message.includes('Fehler') ? 'red' : 'green' }}>{message}</p>}

      <ul>
        {(appointments || []).map((appt, index) => (
          <li key={index}>
            {appt.appointment_time} | Barber: {appt.barber_id} | Service: {appt.service_id}
          </li>
        ))}
      </ul>
    </div>
  )
}
