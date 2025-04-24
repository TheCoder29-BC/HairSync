import readline from 'readline'
import { fetchAppointments } from './services/appointments/fetchAppointments.js'
import { insertAppointment } from './services/appointments/insertAppointment.js'
import { fetchUsers } from './services/users/fetchUsers.js'
import { fetchBarbers } from './services/barbers/fetchBarbers.js'
import { fetchServices } from './services/services/fetchServices.js'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
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
  switch (answer) {
    case '1':
      await fetchAppointments()
      break
    case '2':
      await insertAppointment({
        customer_name: 'Ali Demir',
        barber_id: 1,
        service_id: 2,
        appointment_time: '2025-04-25T14:00:00'
      })
      break
    case '3':
      await fetchUsers()
      break
    case '4':
      await fetchBarbers()
      break
    case '5':
      await fetchServices()
      break
    case '0':
      console.log('Programm beendet.')
      rl.close()
      return
    default:
      console.log('Ungültige Eingabe.')
  }

  showMenu()
}

showMenu()
