import React, { useEffect, useState, useCallback } from 'react'
import { Link, useLocation }          from 'react-router-dom'
import { useAuth }                     from '../context/AuthContext.jsx'
import { supabase }                    from '../supabase/client.js'
import { fetchConversations, fetchUnreadCount } from '../services/chatService.js'
import styles                          from './ConversationsList.module.css'

export default function ConversationsList() {
  const { session } = useAuth()
  const userId      = session.user.id
  const role        = session.user.user_metadata.role
  const location    = useLocation()

  const [convs, setConvs]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  // Conversations laden
  const loadConvs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchConversations(userId, role)
      setConvs(data)
    } catch (err) {
      console.error('Error loading conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, role])

  // Gesamt-Unreads laden
  const loadUnread = useCallback(async () => {
    try {
      const count = await fetchUnreadCount()
      setUnreadCount(count)
    } catch (err) {
      console.error('Error loading unread count:', err)
    }
  }, [])

  // initial + bei Pfadwechsel
  useEffect(() => {
    loadConvs()
    loadUnread()
  }, [location.pathname, loadConvs, loadUnread])

  // Realtime-Subscription auf messages INSERT und conversations UPDATE
  useEffect(() => {
    if (!session) return

    const channel = supabase
      .channel('conversations-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          loadUnread()
          loadConvs()
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations' },
        () => {
          loadUnread()
          loadConvs()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, loadConvs, loadUnread])

  if (loading) return <p className={styles.loading}>Lade Chats …</p>
  if (convs.length === 0)
    return <p className={styles.loading}>Keine Chats vorhanden.</p>

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Chat</h1>

      <div className={styles.grid}>
        {convs.map(c => {
          const title = role === 'customer'
            ? c.barbershop.name
            : `${c.customer.first_name} ${c.customer.last_name}`
          const avatarUrl = role === 'customer'
            ? c.barbershop.logo_url
            : null

          return (
            <Link
              to={`/conversations/${c.id}`}
              key={c.id}
              className={styles.card}
            >
              <div className={styles.avatarWrapper}>
                {avatarUrl
                  ? <img src={avatarUrl} alt={title} className={styles.avatar} />
                  : <div className={styles.avatarPlaceholder} />
                }
              </div>
              <div className={styles.info}>
                <p className={styles.name}>{title}</p>
                {unreadCount > 0 && (
                  <div className={styles.cardBanner}>
                    Sie haben {unreadCount} neue Nachricht{unreadCount > 1 ? 'en' : ''}.
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
