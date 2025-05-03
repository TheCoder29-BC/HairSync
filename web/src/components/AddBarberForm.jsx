// src/components/AddBarberForm.jsx
import { useState } from 'react'

export default function AddBarberForm({ onSubmit }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit({ full_name: fullName, email })
    setFullName('')
    setEmail('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Name"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
      />
      <input
        placeholder="E-Mail"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button type="submit">Friseur anlegen</button>
    </form>
  )
}
