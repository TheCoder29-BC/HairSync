// web/src/services/chatService.js
import { supabase } from '../supabase/client.js'

/**
 * Erstellt oder holt eine Unterhaltung zwischen Kunde & Barbershop
 * und legt bei Neuanlage auch die beiden conversation_members an.
 */
export async function fetchOrCreateConversation(customerId, barbershopId) {
  // 1) Prüfen, ob es schon eine Conversation gibt
  const { data: existing, error: fetchErr } = await supabase
    .from('conversations')
    .select('*')
    .eq('customer_id', customerId)
    .eq('barbershop_id', barbershopId)
    .maybeSingle()
  if (fetchErr) throw fetchErr
  // Wenn vorhanden, zurückgeben
  if (existing) return existing

  // Sonst neu anlegen
  return await createConversation(customerId, barbershopId)
}

async function createConversation(customerId, barbershopId) {
  // a) Neue Conversation anlegen
  const { data: newConv, error: insertErr } = await supabase
    .from('conversations')
    .insert({ customer_id: customerId, barbershop_id: barbershopId })
    .single()
  if (insertErr) throw insertErr

  // b) Shop-Owner-ID holen
  const { data: shop, error: shopErr } = await supabase
    .from('barbershops')
    .select('owner_user_id')
    .eq('id', barbershopId)
    .maybeSingle()
  if (shopErr) console.error('fetchOrCreateConversation/shopErr', shopErr)
  const ownerUserId = shop?.owner_user_id

  // c) Profile upserten für Kunden & Owner (sichert FK)
  const profileRows = [{ id: customerId }]
  if (ownerUserId) profileRows.push({ id: ownerUserId })
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert(profileRows, { onConflict: ['id'] })
  if (profileErr) console.error('fetchOrCreateConversation/profileErr', profileErr)

  // d) Conversation-Member upserten
  const memberRows = [{ conversation_id: newConv.id, user_id: customerId }]
  if (ownerUserId) memberRows.push({ conversation_id: newConv.id, user_id: ownerUserId })
  const { error: cmErr } = await supabase
    .from('conversation_members')
    .upsert(memberRows, { onConflict: ['conversation_id', 'user_id'] })
  if (cmErr) console.error('fetchOrCreateConversation/cmErr', cmErr)

  return newConv
}

/**
 * Holt alle Nachrichten einer Conversation (chronologisch)
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
 * Sendet eine neue Nachricht und setzt global unread-Flag
 */
export async function sendMessage(conversationId, senderId, content) {
  // Nachricht anlegen
  const { data: msg, error: msgErr } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select('id, sender_id, content, created_at')
    .single()
  if (msgErr) throw msgErr

  // has_unread_messages setzen
  const { error: convErr } = await supabase
    .from('conversations')
    .update({ has_unread_messages: true })
    .eq('id', conversationId)
  if (convErr) console.error('sendMessage/convErr', convErr)

  return msg
}

/**
 * Holt alle Conversations für den eingeloggten User
 */
export async function fetchConversations(userId, role) {
  if (role === 'customer') {
    const { data, error } = await supabase
      .from('conversations')
      .select(
        'id, has_unread_messages, barbershop:barbershops!barbershop_id(id,name,logo_url)'
      )
      .eq('customer_id', userId)
    if (error) throw error
    return data
  } else {
    const { data: shops, error: shopErr } = await supabase
      .from('barbershops')
      .select('id')
      .eq('owner_user_id', userId)
    if (shopErr) throw shopErr

    const shopIds = shops.map(s => s.id)
    if (shopIds.length === 0) return []

    const { data, error } = await supabase
      .from('conversations')
      .select(
        'id, has_unread_messages, customer:profiles!customer_id(id,first_name,last_name)'
      )
      .in('barbershop_id', shopIds)
    if (error) throw error
    return data
  }
}

/**
 * Markiert eine Conversation als gelesen:
 * 1) globales has_unread_messages zurücksetzen
 * 2) last_read_at in conversation_members für den aktuellen User setzen
 */
export async function markRead(conversationId) {
  // global Flag
  const { error: globalErr } = await supabase
    .from('conversations')
    .update({ has_unread_messages: false })
    .eq('id', conversationId)
  if (globalErr) console.error('markRead/globalErr', globalErr)

  // user-spezifisch
  const { data: ud, error: userErr } = await supabase.auth.getUser()
  if (userErr) {
    console.error('markRead/getUserErr', userErr)
    return
  }
  const currentUserId = ud.user.id

  const { error: memberErr } = await supabase
    .from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .match({ conversation_id: conversationId, user_id: currentUserId })
  if (memberErr) console.error('markRead/memberErr', memberErr)
}

/**
 * Holt alle Conversation-Member-Datensätze,
 * pflegt fehlende Member nach und gibt user_id + last_read_at zurück.
 */
export async function fetchConversationMembers(conversationId) {
  let { data: members, error } = await supabase
    .from('conversation_members')
    .select('user_id, last_read_at')
    .eq('conversation_id', conversationId)
  if (error) throw error

  if (members.length < 2) {
    // fehlende Zeilen anlegen
    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .select('customer_id, barbershop_id')
      .eq('id', conversationId)
      .maybeSingle()
    if (convErr) throw convErr

    const { data: shop, error: shopErr } = await supabase
      .from('barbershops')
      .select('owner_user_id')
      .eq('id', conv.barbershop_id)
      .maybeSingle()
    if (shopErr) console.error('fetchConversationMembers/shopErr', shopErr)

    const ownerUserId = shop?.owner_user_id
    const toInsert = []
    if (conv.customer_id && !members.some(m => m.user_id === conv.customer_id)) {
      toInsert.push({ conversation_id: conversationId, user_id: conv.customer_id })
    }
    if (ownerUserId && !members.some(m => m.user_id === ownerUserId)) {
      toInsert.push({ conversation_id: conversationId, user_id: ownerUserId })
    }
    if (toInsert.length) {
      const { error: insErr } = await supabase
        .from('conversation_members')
        .upsert(toInsert, { onConflict: ['conversation_id', 'user_id'] })
      if (insErr) console.error('fetchConversationMembers/insErr', insErr)

      // nochmal laden
      const { data: reMembers, error: reErr } = await supabase
        .from('conversation_members')
        .select('user_id, last_read_at')
        .eq('conversation_id', conversationId)
      if (reErr) throw reErr
      members = reMembers
    }
  }

  return members
}

/**
 * Real-Time Subscription für neue Nachrichten
 */
export function subscribeToConversation(conversationId, callback) {
  const channel = supabase
    .channel(`conversation-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      payload => callback(payload.new)
    )
    .subscribe()
  return () => supabase.removeChannel(channel)
}

/**
 * Real-Time Subscription für Read-Receipt-Updates
 */
export function subscribeToReadReceipts(conversationId, callback) {
  const channel = supabase
    .channel(`readreceipts-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversation_members',
        filter: `conversation_id=eq.${conversationId}`
      },
      payload => callback(payload.new)
    )
    .subscribe()
  return () => supabase.removeChannel(channel)
}

/**
 * Holt die Gesamtzahl ungelesener Nachrichten via RPC
 */
export async function fetchUnreadCount() {
  const { data: ud, error: uErr } = await supabase.auth.getUser()
  if (uErr) throw uErr

  const { data: count, error } = await supabase
    .rpc('unread_message_count', { p_user_id: ud.user.id })
  if (error) throw error
  return count
}
