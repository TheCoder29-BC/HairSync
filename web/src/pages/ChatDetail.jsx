// web/src/pages/ChatDetail.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link }                  from 'react-router-dom'
import { useAuth }                          from '../context/AuthContext.jsx'
import {
  fetchMessages,
  sendMessage,
  markRead,
  fetchConversationMembers,
  subscribeToConversation,
  subscribeToReadReceipts
} from '../services/chatService.js'
import { supabase }                         from '../supabase/client.js'
import styles from './ChatDetail.module.css'

export default function ChatDetail() {
  const { session } = useAuth()
  if (!session) return null

  const userId            = session.user.id
  const { conversationId } = useParams()

  const [messages, setMessages]         = useState([])
  const [text, setText]                 = useState('')
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [peerLastRead, setPeerLastRead] = useState(null)

  const bottomRef = useRef(null)
  const unsubMsg  = useRef(null)
  const unsubRead = useRef(null)
  const unsubConv = useRef(null)

  // Sound-Ref
  const notificationSound = useRef(null)

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })

  // 1x beim Mount: Notification-Permission & Sound preload
  useEffect(() => {
    // Desktop-Permission
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(console.error)
    }
    // Sound laden
    notificationSound.current = new Audio('/sounds/notify.mp3')
  }, [])

  useEffect(() => {
    if (!conversationId) return
    let mounted = true

    async function init() {
      try {
        setLoading(true)

        // 1) alle Nachrichten laden
        const msgs = await fetchMessages(conversationId)
        if (!mounted) return
        setMessages(msgs)
        scrollToBottom()

        // 2) Chat als gelesen markieren
        await markRead(conversationId)

        // 3) initial peer read receipt holen
        const members = await fetchConversationMembers(conversationId)
        if (!mounted) return
        const peer = members.find(m => m.user_id !== userId)
        setPeerLastRead(peer?.last_read_at || null)

        // 4) auf neue Nachrichten subscriben
        unsubMsg.current = subscribeToConversation(conversationId, async newMsg => {
          if (!mounted || !newMsg) return

          // Nachricht ins UI
          setMessages(prev => [...prev, newMsg])
          scrollToBottom()

          if (newMsg.sender_id !== userId) {
            // Sound abspielen
            notificationSound.current?.play().catch(() => {})

            // Desktop-Popup, wenn Tab versteckt & berechtigt
            if (
              document.visibilityState === 'hidden' &&
              Notification.permission === 'granted'
            ) {
              new Notification('Neue Chat-Nachricht', {
                body: newMsg.content,
                icon: '/favicon.ico'
              })
            }
            // und gleich als gelesen markieren
            await markRead(conversationId)
          }
        })

        // 5) auf peer read receipts subscriben
        unsubRead.current = subscribeToReadReceipts(conversationId, updatedMember => {
          if (!mounted) return
          if (updatedMember.user_id !== userId) {
            setPeerLastRead(updatedMember.last_read_at)
          }
        })

        // 6) auf conversation.has_unread_messages lauschen
        const channel = supabase
          .channel(`conv-updates-${conversationId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'conversations',
              filter: `id=eq.${conversationId}`
            },
            async ({ new: conv }) => {
              if (conv.has_unread_messages === false) {
                const members2 = await fetchConversationMembers(conversationId)
                const peer2 = members2.find(m => m.user_id !== userId)
                setPeerLastRead(peer2?.last_read_at || null)
              }
            }
          )
          .subscribe()
        unsubConv.current = () => supabase.removeChannel(channel)

      } catch (err) {
        console.error('ChatDetail Error', err)
        if (mounted) setError(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()
    return () => {
      mounted = false
      unsubMsg.current?.()
      unsubRead.current?.()
      unsubConv.current?.()
    }
  }, [conversationId, userId])

  // Nachricht absenden
  const handleSend = async () => {
    const content = text.trim()
    if (!content) return
    setText('')

    try {
      const newMsg = await sendMessage(conversationId, userId, content)
      if (newMsg) {
        setMessages(prev => [...prev, newMsg])
        scrollToBottom()
      }
    } catch (err) {
      console.error('SendMessage Error', err)
      setError(err)
    }
  }

  if (loading) return <p className={styles.loading}>Lade Chat …</p>
  if (error)   return <p className={styles.error}>Fehler: {error.message}</p>

  return (
    <div className={styles.chatContainer}>
      <header className={styles.header}>
        <Link to="/conversations" className={styles.backLink}>
          ← Zurück
        </Link>
      </header>

      <div className={styles.messages}>
        {messages.map(m => {
          const mine = m.sender_id === userId
          return (
            <div
              key={m.id}
              className={mine ? styles.bubbleRight : styles.bubbleLeft}
            >
              {m.content}
              {mine && (
                <span className={styles.receipt}>
                  {peerLastRead && new Date(m.created_at) <= new Date(peerLastRead)
                    ? '✔✔'
                    : '✔'}
                </span>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputContainer}>
        <input
          type="text"
          className={styles.input}
          placeholder="Schreibe eine Nachricht…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
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
