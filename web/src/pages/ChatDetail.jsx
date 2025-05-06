// web/src/pages/ChatDetail.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link }                    from 'react-router-dom'
import { useAuth }                            from '../context/AuthContext.jsx'
import {
  fetchMessages,
  sendMessage,
  // subscribeToMessages  // <–– kannst Du jetzt auskommentieren, wenn Du nur pollst
} from '../services/chatService'
import styles                                 from './ChatDetail.module.css'

export default function ChatDetail() {
  const { session }        = useAuth()
  const userId             = session?.user?.id
  const { conversationId } = useParams()

  const [messages, setMessages] = useState([])
  const [text, setText]         = useState('')
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const bottomRef               = useRef(null)

  // 1) Lade Nachrichten initial
  useEffect(() => {
    if (!userId || !conversationId) return
    let alive = true

    const load = async () => {
      try {
        const msgs = await fetchMessages(conversationId)
        if (!alive) return
        setMessages(msgs)
      } catch (err) {
        console.error(err)
        if (alive) setError(err)
      } finally {
        if (alive) setLoading(false)
      }
    }

    load()

    // 2) Starte Polling alle 2 Sekunden
    const timer = setInterval(load, 2000)

    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [userId, conversationId])

  // 3) Scroll immer nach unten, wenn messages sich ändern
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 4) Nachricht abschicken + sofort nachladen
  const handleSend = async () => {
    const content = text.trim()
    if (!content) return
    setText('')

    try {
      await sendMessage(conversationId, userId, content)
      // direkt nach dem Senden Liste neu laden
      const fresh = await fetchMessages(conversationId)
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
      {/* Zurück-Link */}
      <div className={styles.header}>
        <Link to="/conversations" className={styles.backLink}>
          ← Zurück zu Deinen Chats
        </Link>
      </div>

      {/* Chat-Bubbles */}
      <div className={styles.messages}>
        {messages.map(m => (
          <div
            key={m.id}
            className={
              m.sender_id === userId
                ? `${styles.bubble} ${styles.bubbleRight}`
                : `${styles.bubble} ${styles.bubbleLeft}`
            }
          >
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Eingabefeld */}
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
