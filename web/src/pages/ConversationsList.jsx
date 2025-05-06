import React, { useEffect, useState } from 'react'
import { Link }                      from 'react-router-dom'
import { useAuth }                   from '../context/AuthContext.jsx'
import { fetchConversations }        from '../services/chatService.js'
import styles                        from './ConversationsList.module.css'

export default function ConversationsList() {
  const { session } = useAuth()
  const userId      = session.user.id
  const role        = session.user.user_metadata.role

  const [convs, setConvs]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchConversations(userId, role)
        setConvs(data)
      } catch (err) {
        console.error('Conversations Load Error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId, role])

  if (loading) {
    return <p className={styles.loading}>Lade Chats …</p>
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Deine Chats</h1>
      {convs.length === 0 ? (
        <p>Keine Chats vorhanden.</p>
      ) : (
        <div className={styles.grid}>
          {convs.map(c => {
            // Titel und Avatar je nach Rolle
            const title  = role === 'customer'
              ? c.barbershop.name
              : `${c.customer.first_name} ${c.customer.last_name}`

            const avatar = role === 'customer'
              ? c.barbershop.logo_url
              : c.customer.avatar_url

            // Route: wir gehen bei beiden auf ChatDetail über conversationId
            const to = `/conversations/${c.id}`

            return (
              <Link to={to} key={c.id} className={styles.card}>
                <div className={styles.avatarWrapper}>
                  {avatar
                    ? <img src={avatar} alt={title} className={styles.avatar} />
                    : <div className={styles.avatarPlaceholder} />}
                </div>
                <div className={styles.info}>
                  <p className={styles.name}>{title}</p>
                  {/* Optional: hier könntest du die letzte Nachricht als Vorschau einfügen */}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
