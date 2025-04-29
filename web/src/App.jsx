// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import RegisterBarbershop from './pages/RegisterBarbershop.jsx';
import Barbershops from './pages/Barbershops.jsx';
import ShopDetail from './pages/ShopDetail.jsx';
import CustomerAppointments from './pages/CustomerAppointments.jsx';
import BarberDashboard from './pages/BarberDashboard.jsx';
import Profile from './pages/Profile.jsx'; // ➡️ NEU importiert!
import { useAuth } from './context/AuthContext.jsx';

function RequireAuth({ children, role }) {
  const { session } = useAuth();

  // Während der Session-Ladephase nichts rendern
  if (session === null) return null;

  // Wenn nicht eingeloggt ➔ zurück zur Login-Seite
  if (!session) return <Navigate to="/login" replace />;

  // Rolle prüfen
  const userRole = session.user.user_metadata?.role;
  if (role && userRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Default: Weiterleitung zum Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Öffentliche Routen */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-barbershop" element={<RegisterBarbershop />} />

        {/* Kund:innen-Routen */}
        <Route
          path="/barbershops"
          element={
            <RequireAuth role="customer">
              <Barbershops />
            </RequireAuth>
          }
        />
        <Route
          path="/barbershops/:id"
          element={
            <RequireAuth role="customer">
              <ShopDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/appointments"
          element={
            <RequireAuth role="customer">
              <CustomerAppointments />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth> {/* ❗ Profil-Seite offen für ALLE eingeloggten Benutzer */}
              <Profile />
            </RequireAuth>
          }
        />

        {/* Barber-Routen */}
        <Route
          path="/barber"
          element={
            <RequireAuth role="barber">
              <BarberDashboard />
            </RequireAuth>
          }
        />

        {/* Fallback: Unbekannte Route ➔ Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
