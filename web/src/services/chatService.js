// web/src/services/chatService.js
import { supabase } from '../supabase/client.js'

/**
 * Erstellt oder holt eine Unterhaltung zwischen Kunde & Barbershop
 */
export async function fetchOrCreateConversation(customerId, barbershopId) {
  const { data: existing, error: fetchErr } = await supabase
    .from('conversations')
    .select('*')
    .eq('customer_id', customerId)
    .eq('barbershop_id', barbershopId)
    .maybeSingle()

  if (fetchErr) throw fetchErr
  if (existing) return existing

  const { data: newConv, error: insertErr } = await supabase
    .from('conversations')
    .insert({
      customer_id:   customerId,
      barbershop_id: barbershopId
    })
    .single()

  if (insertErr) throw insertErr
  return newConv
}

/**
 * Holt alle Nachrichten einer Conversation (chronologisch aufsteigend)
 */
export async function fetchMessages(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Sendet eine neue Nachricht in eine Conversation
 */
export async function sendMessage(conversationId, senderId, content) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id:       senderId,
      content:         content
    })
    .single()

  if (error) throw error
  return data
}

/**
 * Echtzeit-Subscription auf neue Nachrichten in einer Conversation
 * Rückgabe: eine Funktion zum Abbestellen
 */
export function subscribeToMessages(conversationId, callback) {
  const channel = supabase
    .channel(`conversation_messages_${conversationId}`)
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      ({ new: message }) => callback(message)
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Holt alle Conversations für den eingeloggten User.
 * - role==='customer': alle Conversations, bei denen customer_id == userId,
 *     inkl. barbershop(id,name,logo_url)
 * - role==='barbershop': alle Conversations, bei denen barbershop_id
 *     in den Shops ist, die dieser Owner angelegt hat,
 *     inkl. customer(id,first_name,last_name)
 */
export async function fetchConversations(userId, role) {
  if (role === 'customer') {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        barbershop:barbershops!barbershop_id(
          id,
          name,
          logo_url
        )
      `)
      .eq('customer_id', userId)

    if (error) throw error
    return data
  } else {
    // Barbershop-Owner: erst alle Shop-IDs des Owners laden
    const { data: shops, error: shopErr } = await supabase
      .from('barbershops')
      .select('id')
      .eq('owner_user_id', userId)
    if (shopErr) throw shopErr

    const shopIds = shops.map(s => s.id)
    if (shopIds.length === 0) return []

    // dann alle Conversations für diese Shops, ohne avatar_url
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        customer:profiles!customer_id(
          id,
          first_name,
          last_name
        )
      `)
      .in('barbershop_id', shopIds)

    if (error) throw error
    return data
  }
}
