// src/services/barbers.js
export async function createBarber(barberData) {
  const res = await fetch('/api/functions/create-barber', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(barberData),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Create Barber failed (${res.status}): ${text}`)
  }
  return res.json()
}
