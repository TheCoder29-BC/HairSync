// web/src/pages/Chat.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link }                    from 'react-router-dom'
import { useAuth }                            from '../context/AuthContext.jsx'
import {
  fetchOrCreateConversation,
  fetchMessages,
  sendMessage,
  subscribeToMessages
} from '../services/chatService'
import styles                                 from './Chat.module.css'

export default function Chat() {
  const { session }      = useAuth()
  const userId           = session?.user?.id
  const { barbershopId } = useParams()       // aus Route /chat/:barbershopId

  const [conv, setConv]       = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText]         = useState('')
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const unsubRef                = useRef(null)
  const bottomRef               = useRef(null)

  // 1) Conversation holen/erstellen, danach Nachrichten + Subscription
  useEffect(() => {
    if (!userId || !barbershopId) return
    let alive = true

    async function init() {
      try {
        // 1a) Konversation laden oder neu anlegen
        const c = await fetchOrCreateConversation(userId, barbershopId)
        if (!alive) return
        setConv(c)

        // 1b) Nachrichten laden
        const msgs = await fetchMessages(c.id)
        if (!alive) return
        setMessages(msgs)

        // 1c) Realtime-Subscription: bei neuer Nachricht → komplett neu laden
        unsubRef.current = subscribeToMessages(c.id, () => {
          fetchMessages(c.id).then(full => {
            if (alive) setMessages(full)
          })
        })
      } catch (err) {
        console.error('Chat-Init-Error', err)
        if (alive) setError(err)
      } finally {
        if (alive) setLoading(false)
      }
    }

    init()
    return () => {
      alive = false
      if (unsubRef.current) unsubRef.current()
    }
  }, [userId, barbershopId])

  // 2) Immer ans Ende scrollen, wenn messages sich ändern
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 3) Nachricht absenden & danach erneut vom Server laden
  const handleSend = async () => {
    const content = text.trim()
    if (!content || !conv?.id) return

    setText('')
    try {
      await sendMessage(conv.id, userId, content)
      // nach dem Senden: komplette Liste nochmal holen
      const fresh = await fetchMessages(conv.id)
      setMessages(fresh)
    } catch (err) {
      console.error('SendMessage-Error', err)
      setError(err)
    }
  }

  if (!session) return null
  if (loading)  return <p className={styles.loading}>Lade Chat …</p>
  if (error)    return <p className={styles.errorBanner}>Fehler: {error.message}</p>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/conversations" className={styles.backLink}>
          ← Zurück zu Deinen Chats
        </Link>
      </div>

      <div className={styles.messages}>
        {messages.map(m => {
          if (!m?.id) return null
          const isMine = m.sender_id === userId
          return (
            <div
              key={m.id}
              className={
                isMine
                  ? `${styles.bubble} ${styles.bubbleRight}`
                  : `${styles.bubble} ${styles.bubbleLeft}`
              }
            >
              {m.content}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          type="text"
          placeholder="Schreibe eine Nachricht…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <button
          className={styles.sendButton}
          onClick={handleSend}
          disabled={!text.trim()}
        >
          Senden
        </button>
      </div>
    </div>
  )
}
