// src/pages/BarberRegister.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'

export default function BarberRegister() {
  const [shopName, setShopName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'barber',
          shop_name: shopName,
          phone,
          address,
        },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-md shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Barbershop registrieren</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Shop-Name"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="tel"
            placeholder="Telefonnummer"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="Adresse (Straße, Ort, PLZ)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600">
            Registrieren
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Bereits registriert?{' '}
          <Link to="/login" className="text-yellow-600 hover:underline">
            Hier einloggen
          </Link>
        </p>
      </div>
    </div>
  )
}
