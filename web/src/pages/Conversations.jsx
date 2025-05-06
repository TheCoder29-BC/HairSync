// web/src/pages/Conversations.jsx
import React, { useEffect, useState } from 'react'
import { Link }                        from 'react-router-dom'
import { useAuth }                     from '../context/AuthContext.jsx'
import { fetchConversations }          from '../services/chatService'
import styles                          from './Conversations.module.css'

export default function Conversations() {
  const { session } = useAuth()
  const userId      = session?.user?.id

  const [convs, setConvs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetchConversations(userId)
      .then(data => setConvs(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <p>Lade Konversationen …</p>
  if (error)   return <p>Fehler: {error.message}</p>

  return (
    <div className={styles.container}>
      <h1>Deine Chats</h1>
      <ul className={styles.list}>
        {convs.map(c => (
          <li key={c.id}>
            <Link to={`/chat/${c.barbershop.id}`} className={styles.link}>
              <div className={styles.name}>
                {c.barbershop.name}
              </div>
              <div className={styles.meta}>
                Du ↔ {c.barbershop.name}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
