// src/components/SlotScheduler.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase/client.js'
import { useTranslation } from 'react-i18next'
import styles from './SlotScheduler.module.css'

export default function SlotScheduler({ shopId }) {
  const { t } = useTranslation()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [barbers, setBarbers] = useState([])
  const [selectedBarber, setSelectedBarber] = useState(null)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)

  // Lade verfügbare Barbers für den Shop
  useEffect(() => {
    supabase
      .from('barbers')
      .select('id,full_name')
      .eq('barbershop_id', shopId)
      .order('full_name')
      .then(({ data, error }) => {
        if (!error) {
          setBarbers(data)
          // Default: erster Barber
          if (data.length > 0) setSelectedBarber(data[0].id)
        }
      })
  }, [shopId])

  // Slots laden + realtime subscription
  useEffect(() => {
    if (!selectedBarber) return
    let subscription
    async function fetchSlots() {
      setLoading(true)
      const { data, error } = await supabase
        .from('appointment_slots')
        .select('*')
        .eq('barbershop_id', shopId)
        .eq('barber_id', selectedBarber)
        .eq('slot_date', date)
        .order('slot_time', { ascending: true })
      if (!error) setSlots(data)
      setLoading(false)

      // Realtime-Updates
      subscription = supabase
        .from(
          `appointment_slots:barbershop_id=eq.${shopId},barber_id=eq.${selectedBarber},slot_date=eq.${date}`
        )
        .on('UPDATE', payload => {
          setSlots(curr => curr.map(s => s.id === payload.new.id ? payload.new : s))
        })
        .subscribe()
    }
    fetchSlots()

    return () => {
      if (subscription) supabase.removeSubscription(subscription)
    }
  }, [date, selectedBarber, shopId])

  const bookSlot = async slotId => {
    const { error } = await supabase
      .from('appointment_slots')
      .update({ is_booked: true })
      .eq('id', slotId)
    if (error) alert(t('error_generic') + ': ' + error.message)
  }

  return (
    <div className={styles.scheduler}>
      {/* Barber-Auswahl */}
      <label>
        {t('select_barber')}:
        <select
          value={selectedBarber || ''}
          onChange={e => setSelectedBarber(e.target.value)}
          className={styles.selectBarber}
        >
          {barbers.map(b => (
            <option key={b.id} value={b.id}>
              {b.full_name}
            </option>
          ))}
        </select>
      </label>

      {/* Datumsauswahl */}
      <label>
        {t('select_date')}:
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className={styles.datePicker}
        />
      </label>

      {loading ? (
        <p>{t('loading')}</p>
      ) : (
        <div className={styles.slotsGrid}>
          {slots.map(slot => (
            <button
              key={slot.id}
              disabled={slot.is_booked}
              className={`${styles.slotButton} ${slot.is_booked ? styles.booked : ''}`}
              onClick={() => bookSlot(slot.id)}
            >
              {slot.slot_time.slice(0, 5)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
