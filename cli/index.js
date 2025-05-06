#!/usr/bin/env node
// cli/index.js

// 1) .env laden
require('dotenv').config();

// 2) Node-Standardmodule
const readline = require('readline');

// 3) Deine Services
const { fetchAppointments } = require('../services/appointments/fetchAppointments');
const { insertAppointment  } = require('../services/appointments/insertAppointment');
const { fetchUsers         } = require('../services/users/fetchUsers');
const { fetchBarbers       } = require('../services/barbers/fetchBarbers');
const { fetchServices      } = require('../services/services/fetchServices');

// 4) .env-Variablen prüfen
console.log('Loaded SUPABASE_URL:',       process.env.SUPABASE_URL);
console.log('Loaded SUPABASE_ANON_KEY:',  process.env.SUPABASE_ANON_KEY
  ? process.env.SUPABASE_ANON_KEY.slice(0,10) + '…'
  : undefined
);

// 5) readline-Interface
const rl = readline.createInterface({
  input:  process.stdin,
  output: process.stdout,
});

// 6) Menü
function showMenu() {
  console.log('\n🧔 Barber App Menü:');
  console.log('1. Termine anzeigen');
  console.log('2. Neuen Termin einfügen');
  console.log('3. Nutzer anzeigen');
  console.log('4. Friseure anzeigen');
  console.log('5. Services anzeigen');
  console.log('0. Beenden');
  rl.question('\nBitte Auswahl eingeben: ', handleInput);
}

// 7) Input verarbeiten
async function handleInput(answer) {
  answer = answer.trim();
  try {
    switch (answer) {
      case '1':
        console.log('\n📅 Termine:');
        console.table(await fetchAppointments());
        break;
      case '2':
        console.log('\n➕ Neuen Termin einfügen…');
        console.log(await insertAppointment({
          customer_name:   'Ali Demir',
          barber_id:       1,
          service_id:      2,
          appointment_time:'2025-04-25T14:00:00',
        }));
        break;
      case '3':
        console.log('\n👥 Nutzer:');
        console.table(await fetchUsers());
        break;
      case '4':
        console.log('\n💈 Friseure:');
        console.table(await fetchBarbers());
        break;
      case '5':
        console.log('\n💇 Services:');
        console.table(await fetchServices());
        break;
      case '0':
        console.log('👋 Programm beendet.');
        return rl.close();
      default:
        console.log('❌ Ungültige Eingabe.');
    }
  } catch (err) {
    console.error('🚨 Fehler:', err.message);
  }
  showMenu();
}

// 8) Start
showMenu();
