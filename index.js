#!/usr/bin/env node
// index.js

import readline from 'readline'
import { fetchAppointments } from './services/appointments/fetchAppointments.js'
import { insertAppointment } from './services/appointments/insertAppointment.js'
import { fetchUsers } from './services/users/fetchUsers.js'
import { fetchBarbers } from './services/barbers/fetchBarbers.js'
import { fetchServices } from './services/services/fetchServices.js'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function showMenu() {
  console.log('\n🧔 Barber App Menü:')
  console.log('1. Termine anzeigen')
  console.log('2. Neuen Termin einfügen')
  console.log('3. Nutzer anzeigen')
  console.log('4. Friseure anzeigen')
  console.log('5. Services anzeigen')
  console.log('0. Beenden')
  rl.question('\nBitte Auswahl eingeben: ', handleInput)
}

async function handleInput(answer) {
  answer = answer.trim()
  try {
    switch (answer) {
      case '1':
        console.log('\n📅 Termine:')
        const appointments = await fetchAppointments()
        console.table(appointments)
        break

      case '2':
        console.log('\n➕ Neuen Termin einfügen...')
        // Beispiel mit statischen Daten – du kannst hier weitere rl.question-Aufrufe einbauen
        const newAppt = await insertAppointment({
          customer_name   : 'Ali Demir',
          barber_id       : 1,
          service_id      : 2,
          appointment_time: '2025-04-25T14:00:00',
        })
        console.log('✔️ Eingefügter Termin:')
        console.log(newAppt)
        break

      case '3':
        console.log('\n👥 Nutzer:')
        const users = await fetchUsers()
        console.table(users)
        break

      case '4':
        console.log('\n💈 Friseure:')
        const barbers = await fetchBarbers()
        console.table(barbers)
        break

      case '5':
        console.log('\n💇 Services:')
        const services = await fetchServices()
        console.table(services)
        break

      case '0':
        console.log('👋 Programm beendet.')
        return rl.close()

      default:
        console.log('❌ Ungültige Eingabe.')
    }
  } catch (err) {
    console.error('🚨 Fehler:', err.message)
  }

  // Menü erneut anzeigen
  showMenu()
}

showMenu()
