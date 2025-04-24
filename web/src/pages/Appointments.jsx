// src/pages/Appointments.jsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchAppointments, createAppointment, cancelAppointment } from '../services/appointmentsService'

export default function Appointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [barbers, setBarbers] = useState([])
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ date: '', time: '', barber_id: '', service_id: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!user || !user.access_token) {
        setMessage('Nicht eingeloggt oder kein Token gefunden.')
        setLoading(false)
        return
      }

      try {
        let appointmentsRes = await fetchAppointments(user.access_token)
        if (!Array.isArray(appointmentsRes)) appointmentsRes = []

        const barbersRes = await fetch('/api/barbers')
        const servicesRes = await fetch('/api/services')

        if (!barbersRes.ok || !servicesRes.ok) {
          throw new Error('Fehler beim Abrufen von Barbern oder Services')
        }

        const barbersData = await barbersRes.json()
        const servicesData = await servicesRes.json()

        setAppointments(appointmentsRes)
        setBarbers(barbersData)
        setServices(servicesData)
      } catch (err) {
        console.error('Fehler beim Laden der Daten:', err)
        setMessage('Verbindungsfehler beim Laden der Termine')
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
      user_id: userId,
      barber_id: form.barber_id,
      service_id: form.service_id,
      appointment_time: `${form.date}T${form.time}`,
      status: 'confirmed'
    }

    try {
      const result = await createAppointment(appointment, user.access_token)

      if (result.error) {
        setMessage(`❌ ${result.error}`)
      } else {
        setMessage('✅ Termin erfolgreich erstellt')
        setAppointments([...appointments, result])
      }
    } catch (err) {
      console.error('Fehler beim Erstellen:', err)
      setMessage('Fehler beim Erstellen des Termins.')
    }
  }

  const handleCancel = async (id) => {
    if (!user?.access_token) return

    try {
      await cancelAppointment(id, user.access_token)
      setAppointments(prev => prev.filter(appt => appt.id !== id))
      setMessage('✅ Termin erfolgreich storniert')
    } catch (err) {
      console.error('Fehler beim Stornieren:', err)
      setMessage('Fehler beim Stornieren des Termins')
    }
  }

  if (loading) return <p>Lade Daten...</p>

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
        <select
          value={form.barber_id}
          onChange={e => setForm({ ...form, barber_id: e.target.value })}
          required
        >
          <option value=''>Barber wählen</option>
          {barbers.map(b => (
            <option key={b.id} value={b.id}>{b.full_name}</option>
          ))}
        </select>
        <select
          value={form.service_id}
          onChange={e => setForm({ ...form, service_id: e.target.value })}
          required
        >
          <option value=''>Service wählen</option>
          {services.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button type="submit">Termin buchen</button>
      </form>

      {message && <p style={{ color: message.includes('Fehler') ? 'red' : 'green' }}>{message}</p>}

      <ul>
        {appointments.map((appt, i) => (
          <li key={i}>
            {appt.appointment_time} – Barber: {appt.barber_id}, Service: {appt.service_id}
            <button onClick={() => handleCancel(appt.id)} style={{ marginLeft: '1rem' }}>Stornieren</button>
          </li>
        ))}
      </ul>
    </div>
  )
}