// src/pages/BarbershopSchedule.jsx
import React, { useEffect, useState } from "react";
import { useNavigate }                 from "react-router-dom";
import { supabase }                    from "../supabase/client.js";
import { useAuth }                     from "../context/AuthContext.jsx";
import styles                          from "./BarbershopSchedule.module.css";

export default function BarbershopSchedule() {
  const { session } = useAuth();
  const navigate    = useNavigate();

  const [shopId,    setShopId]    = useState(null);
  const [barbers,   setBarbers]   = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading,   setLoading]   = useState(true);

  // State fürs Hinzufügen neuer Einträge
  const [newEntry, setNewEntry] = useState({
    barber_id:  "",
    date:       "",
    status:     "working",
    start_time: "",
    end_time:   ""
  });

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoading(true);
      // 1) Shop-ID
      const { data: shopData, error: shopErr } = await supabase
        .from("barbershops")
        .select("id")
        .eq("owner_user_id", session.user.id)
        .maybeSingle();
      if (shopErr) {
        console.error(shopErr);
        setLoading(false);
        return;
      }
      if (!shopData) {
        navigate("/register-barbershop");
        return;
      }
      setShopId(shopData.id);

      // 2) Barbers laden
      const { data: barbersData, error: barbersErr } = await supabase
        .from("barbers")
        .select("id, full_name")
        .eq("barbershop_id", shopData.id)
        .order("full_name");
      if (barbersErr) {
        console.error(barbersErr);
        setLoading(false);
        return;
      }
      setBarbers(barbersData);

      // 3) Dienstplan laden
      await reloadSchedules(barbersData);
      setLoading(false);
    })();
  }, [session, navigate]);

  // lädt alle Termine
  async function reloadSchedules(barbersList = barbers) {
    const ids = barbersList.map(b => b.id);
    const { data, error } = await supabase
      .from("barber_schedules")
      .select("*")
      .in("barber_id", ids)
      .order("date", { ascending: true });
    if (error) console.error(error);
    else       setSchedules(data);
  }

  // speichert oder updated einen Eintrag
  async function saveSchedule(entry) {
    const payload = {
      barber_id:  entry.barber_id,
      date:       entry.date,
      status:     entry.status,
      start_time: entry.status === "working" ? entry.start_time : null,
      end_time:   entry.status === "working" ? entry.end_time   : null
    };
    const { error } = await supabase
      .from("barber_schedules")
      .upsert(payload, {
        onConflict: ["barber_id", "date"],
        returning:  "minimal"
      });
    if (error) console.error("Save failed:", error);
    else       reloadSchedules();
  }

  // löscht einen Eintrag
  async function deleteSchedule(entry) {
    const { error } = await supabase
      .from("barber_schedules")
      .delete()
      .match({ barber_id: entry.barber_id, date: entry.date });
    if (error) console.error("Delete failed:", error);
    else       reloadSchedules();
  }

  // Handler für neues Entry-Form
  const handleAdd = async e => {
    e.preventDefault();
    if (!newEntry.barber_id || !newEntry.date) return;
    await saveSchedule(newEntry);
    setNewEntry({
      barber_id:  "",
      date:       "",
      status:     "working",
      start_time: "",
      end_time:   ""
    });
  };

  if (loading) return <p className={styles.loading}>Lade Dienstplan…</p>;

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Dienstplan</h1>

      {/* neues Entry-Form */}
      <form className={styles.newRow} onSubmit={handleAdd}>
        <select
          required
          value={newEntry.barber_id}
          onChange={e =>
            setNewEntry(ne => ({ ...ne, barber_id: e.target.value }))
          }
        >
          <option value="">Barber wählen</option>
          {barbers.map(b => (
            <option key={b.id} value={b.id}>{b.full_name}</option>
          ))}
        </select>

        <input
          type="date"
          required
          value={newEntry.date}
          onChange={e =>
            setNewEntry(ne => ({ ...ne, date: e.target.value }))
          }
        />

        <select
          value={newEntry.status}
          onChange={e =>
            setNewEntry(ne => ({ ...ne, status: e.target.value }))
          }
        >
          <option value="working">Arbeitet</option>
          <option value="free">Frei</option>
          <option value="vacation">Urlaub</option>
          <option value="sick">Krank</option>
        </select>

        <input
          type="time"
          value={newEntry.start_time}
          disabled={newEntry.status !== "working"}
          onChange={e =>
            setNewEntry(ne => ({ ...ne, start_time: e.target.value }))
          }
        />
        <input
          type="time"
          value={newEntry.end_time}
          disabled={newEntry.status !== "working"}
          onChange={e =>
            setNewEntry(ne => ({ ...ne, end_time: e.target.value }))
          }
        />

        <button type="submit" className={styles.addBtn}>
          Hinzufügen
        </button>
      </form>

      {/* bestehende Einträge (inline edit + löschen) */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Barber</th>
            <th>Datum</th>
            <th>Status</th>
            <th>Von</th>
            <th>Bis</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map(e => {
            const barber = barbers.find(b => b.id === e.barber_id);
            return (
              <tr key={`${e.barber_id}-${e.date}`}>
                <td>{barber?.full_name}</td>
                <td>{new Date(e.date).toLocaleDateString("de-DE")}</td>
                <td>
                  <select
                    value={e.status}
                    onChange={ev => saveSchedule({ ...e, status: ev.target.value })}
                  >
                    <option value="working">Arbeitet</option>
                    <option value="free">Frei</option>
                    <option value="vacation">Urlaub</option>
                    <option value="sick">Krank</option>
                  </select>
                </td>
                <td>
                  <input
                    type="time"
                    value={e.start_time?.substring(0,5) ?? ""}
                    disabled={e.status !== "working"}
                    onChange={ev =>
                      saveSchedule({ ...e, start_time: ev.target.value })
                    }
                  />
                </td>
                <td>
                  <input
                    type="time"
                    value={e.end_time?.substring(0,5) ?? ""}
                    disabled={e.status !== "working"}
                    onChange={ev =>
                      saveSchedule({ ...e, end_time: ev.target.value })
                    }
                  />
                </td>
                <td>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteSchedule(e)}
                  >
                    Löschen
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
