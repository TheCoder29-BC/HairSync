export async function fetchAppointments(token) {
  const res = await fetch('/api/appointments', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return await res.json()
}

export async function createAppointment(appointment, token) {
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(appointment)
  })
  return await res.json()
}