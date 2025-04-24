// src/services/appointmentsService.js

// ✅ GET /api/appointments
export async function fetchAppointments(token) {
  const res = await fetch('/api/appointments', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const { data, error } = await res.json()

  if (!res.ok) throw new Error(error || 'Fehler beim Abrufen der Termine')

  return data || []
}

// ✅ POST /api/appointments
export async function createAppointment(appointment, token) {
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(appointment)
  })

  const { data, error } = await res.json()

  if (!res.ok) throw new Error(error || 'Fehler beim Erstellen des Termins')

  return data
}

// ✅ DELETE /api/appointments/:id
export async function cancelAppointment(id, token) {
  const res = await fetch(`/api/appointments/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const { data, error } = await res.json()

  if (!res.ok) throw new Error(error || 'Fehler beim Löschen des Termins')

  return data
}
