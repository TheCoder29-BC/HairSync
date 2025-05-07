// web/src/pages/StartConversation.jsx
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchOrCreateConversation } from '../services/chatService.js'

export default function StartConversation() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const { barbershopId } = useParams()

  useEffect(() => {
    if (!session) return
    const customerId = session.user.id
    fetchOrCreateConversation(customerId, barbershopId)
      .then(conv => {
        navigate(`/conversations/${conv.id}`, { replace: true })
      })
      .catch(err => {
        console.error('Fehler beim Starten der Konversation', err)
      })
  }, [session, barbershopId, navigate])

  return null  // oder ein kleiner Loader-Spinner
}
