// src/pages/BarbershopDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate }               from "react-router-dom";
import { supabase }                  from "../supabase/client.js";
import { useAuth }                   from "../context/AuthContext.jsx";
import styles                        from "./BarbershopDashboard.module.css";

export default function BarbershopDashboard() {
  const { session } = useAuth();
  const navigate    = useNavigate();

  // ── Shop-Daten ─────────────────────────────
  const [shop, setShop]               = useState(null);
  const [shopName, setShopName]       = useState("");
  const [logoFile, setLogoFile]       = useState(null);
  const [imgFile,  setImgFile]        = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [imgPreview, setImgPreview]   = useState(null);

  // ── Öffnungszeiten & Services ───────────────
  const [openingHours, setOpeningHours] = useState([]);
  const [services,     setServices]     = useState([]);

  // ── Barber-Verwaltung ───────────────────────
  const [barbers,    setBarbers]   = useState([]);
  const [newBarber,  setNewBarber] = useState({
    full_name: "",
    email:     "",
    password:  ""
  });

  // ── UI-State ─────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Default-Stunden (falls leer)
  const defaultHours = Array.from({ length: 7 }, (_, i) => ({
    id:          null,
    day_of_week: i + 1,
    open_time:   "",
    close_time:  "",
    is_closed:   false
  }));

  // ── Initiales Laden ───────────────────────────
  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoading(true);
      const { data: shopData, error: shopErr } = await supabase
        .from("barbershops")
        .select("*")
        .eq("owner_user_id", session.user.id)
        .maybeSingle();

      if (shopErr || !shopData) {
        if (!shopErr) alert("Kein Shop gefunden – bitte anlegen");
        navigate("/register-barbershop");
        setLoading(false);
        return;
      }

      setShop(shopData);
      setShopName(shopData.name);
      setLogoPreview(shopData.logo_url);
      setImgPreview(shopData.image_url);

      await reloadHours(shopData.id);
      await reloadServices(shopData.id);
      await reloadBarbers(shopData.id);

      setLoading(false);
    })();
  }, [session, navigate]);

  // ── Öffnungszeiten laden ──────────────────────
  const reloadHours = async id => {
    const { data, error } = await supabase
      .from("opening_hours")
      .select("*")
      .eq("barbershop_id", id)
      .order("day_of_week");

    if (!error) {
      setOpeningHours(
        defaultHours.map(d => {
          const found = data.find(r => r.day_of_week === d.day_of_week);
          return found
            ? { ...d, id: found.id, open_time: found.open_time, close_time: found.close_time, is_closed: found.is_closed }
            : d;
        })
      );
    }
  };

  async function saveOpeningHours() {
    if (!shop) return;
    setLoading(true);
    const payload = openingHours.map(r => ({
      id:            r.id ?? undefined,
      barbershop_id: shop.id,
      day_of_week:   r.day_of_week,
      open_time:     r.is_closed ? null : (r.open_time || null),
      close_time:    r.is_closed ? null : (r.close_time || null),
      is_closed:     r.is_closed
    }));

    const { error } = await supabase
      .from("opening_hours")
      .upsert(payload, {
        onConflict: ["barbershop_id", "day_of_week"],
        returning:  "minimal"
      });

    if (error) setMessage("Fehler beim Speichern der Öffnungszeiten.");
    else {
      await reloadHours(shop.id);
      setMessage("Öffnungszeiten gespeichert!");
    }
    setTimeout(() => setMessage(""), 3000);
    setLoading(false);
  }

  // ── Services laden ────────────────────────────
  const reloadServices = async id => {
    const { data, error } = await supabase
      .from("shop_services")
      .select("*")
      .eq("barbershop_id", id);
    if (!error) setServices(data);
  };

  async function saveService(entry) {
    await supabase
      .from("shop_services")
      .upsert({
        id:            entry.id,
        name:          entry.name,
        price:         parseFloat(entry.price),
        barbershop_id: shop.id
      }, {
        onConflict: ["id"],
        returning:  "minimal"
      });
    reloadServices(shop.id);
  }

  async function removeService(id) {
    if (!confirm("Service löschen?")) return;
    await supabase
      .from("shop_services")
      .delete()
      .eq("id", id);
    setServices(s => s.filter(x => x.id !== id));
  }

  async function addService() {
    const { data, error } = await supabase
      .from("shop_services")
      .insert({ barbershop_id: shop.id, name: "", price: 0 })
      .select()
      .single();
    if (!error) setServices(s => [...s, data]);
  }

  // ── Barbers laden ─────────────────────────────
  const reloadBarbers = async id => {
    const { data, error } = await supabase
      .from("barbers")
      .select("id, full_name, user_id, is_active")
      .eq("barbershop_id", id)
      .order("full_name");
    if (!error) setBarbers(data);
  };

  // ── Edge Function aufrufen ────────────────────
  async function createBarber({ full_name, email, password }) {
    const { data, error } = await supabase.functions.invoke("create-barber", {
      body: JSON.stringify({
        full_name,
        email,
        password,
        barbershop_id: shop.id,
      }),
    });
    if (error) throw error;
    return data;
  }

  async function handleAddBarber(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // Neuen Barber anlegen
      await createBarber(newBarber);
      // Liste neu laden, so ist er sofort sichtbar
      await reloadBarbers(shop.id);
      // Formular zurücksetzen
      setNewBarber({ full_name: "", email: "", password: "" });
    } catch (err) {
      alert("Fehler: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Barber sperren/löschen ───────────────────
  async function toggleBarberActive(id, act) {
    await supabase
      .from("barbers")
      .update({ is_active: act })
      .eq("id", id);
    reloadBarbers(shop.id);
  }

  async function deleteBarber(id) {
    if (!confirm("Barber wirklich löschen?")) return;
    await supabase
      .from("barbers")
      .delete()
      .eq("id", id);
    reloadBarbers(shop.id);
  }

  // ── Shop-Daten speichern ──────────────────────
  async function saveShopDetails(e) {
    e.preventDefault();
    if (!shop) return;
    setLoading(true);

    let logo_url  = shop.logo_url;
    let image_url = shop.image_url;

    if (logoFile) {
      const ext      = logoFile.name.split(".").pop();
      const path     = `${shop.id}/logo_${Date.now()}.${ext}`;
      const { data: up } = await supabase
        .storage
        .from("shop-logos")
        .upload(path, logoFile, { upsert: true });
      logo_url = (await supabase
        .storage
        .from("shop-logos")
        .getPublicUrl(up.path)
      ).data.publicURL;
    }

    if (imgFile) {
      const ext      = imgFile.name.split(".").pop();
      const path     = `${shop.id}/img_${Date.now()}.${ext}`;
      const { data: up } = await supabase
        .storage
        .from("shop-images")
        .upload(path, imgFile, { upsert: true });
      image_url = (await supabase
        .storage
        .from("shop-images")
        .getPublicUrl(up.path)
      ).data.publicURL;
    }

    const { error } = await supabase
      .from("barbershops")
      .update({ name: shopName, logo_url, image_url })
      .eq("id", shop.id);

    if (error) setMessage("Speichern fehlgeschlagen.");
    else {
      setShop({ ...shop, name: shopName, logo_url, image_url });
      setLogoFile(null);
      setImgFile(null);
      setMessage("Shop-Daten gespeichert!");
    }
    setTimeout(() => setMessage(""), 3000);
    setLoading(false);
  }

  if (loading) return <p className={styles.loading}>Lade Daten…</p>;
  if (!shop)    return null;

  return (
    <div className={styles.wrapper}>
      <section className={styles.card}>
        {/* ─── Linke Spalte: Shop-Daten ────────────── */}
        <div className={styles.left}>
          <h1 className={styles.title}>Willkommen, {shop.name}!</h1>
          {logoPreview && <img src={logoPreview} alt="Logo" className={styles.thumbnail} />}
          {imgPreview  && <img src={imgPreview } alt="Shop" className={styles.thumbnail} />}

          <h2 className={styles.title}>Shop-Daten</h2>
          <form onSubmit={saveShopDetails} className={styles.form}>
            <input
              className={styles.input}
              placeholder="Shop-Name"
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              required
            />
            <label>
              Logo:
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  setLogoFile(e.target.files[0]);
                  setLogoPreview(URL.createObjectURL(e.target.files[0]));
                }}
              />
            </label>
            <label>
              Shop-Bild:
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  setImgFile(e.target.files[0]);
                  setImgPreview(URL.createObjectURL(e.target.files[0]));
                }}
              />
            </label>
            <button className={styles.button}>Speichern</button>
          </form>
        </div>

        {/* ─── Rechte Spalte: Einstellungen ────────── */}
        <div className={styles.right}>
          {message && <div className={styles.success}>{message}</div>}

          {/* Öffnungszeiten */}
          <div className={styles.subsection}>
            <h2 className={styles.title}>Öffnungszeiten</h2>
            <div className={styles.hoursGrid}>
              <div className={styles.gridHeader}>Tag</div>
              <div className={styles.gridHeader}>Status</div>
              <div className={styles.gridHeader}>Öffnet</div>
              <div className={styles.gridHeader}>Schließt</div>
              {openingHours.map((h, i) => (
                <React.Fragment key={h.day_of_week}>
                  <div className={styles.gridCell}>
                    {["Mo","Di","Mi","Do","Fr","Sa","So"][h.day_of_week - 1]}
                  </div>
                  <select
                    value={h.is_closed ? "closed" : "open"}
                    onChange={e => {
                      const a = [...openingHours];
                      a[i].is_closed = e.target.value === "closed";
                      setOpeningHours(a);
                    }}
                  >
                    <option value="open">Offen</option>
                    <option value="closed">Geschlossen</option>
                  </select>
                  <input
                    type="time"
                    className={styles.timeInput}
                    value={h.open_time || ""}
                    disabled={h.is_closed}
                    onChange={e => {
                      const a = [...openingHours];
                      a[i].open_time = e.target.value;
                      setOpeningHours(a);
                    }}
                  />
                  <input
                    type="time"
                    className={styles.timeInput}
                    value={h.close_time || ""}
                    disabled={h.is_closed}
                    onChange={e => {
                      const a = [...openingHours];
                      a[i].close_time = e.target.value;
                      setOpeningHours(a);
                    }}
                  />
                </React.Fragment>
              ))}
            </div>
            <button onClick={saveOpeningHours} className={styles.button}>
              Öffnungszeiten speichern
            </button>
          </div>

          {/* Leistungen & Preise */}
          <div className={styles.subsection}>
            <h2 className={styles.title}>Leistungen & Preise</h2>
            <table className={styles.servicesTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Preis (€)</th>
                  <th>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id}>
                    <td>
                      <input
                        className={styles.input}
                        value={s.name}
                        onChange={e => setServices(ss =>
                          ss.map(x => x.id === s.id ? { ...x, name: e.target.value } : x)
                        )}
                      />
                    </td>
                    <td>
                      <input
                        className={styles.input}
                        type="number"
                        value={s.price}
                        onChange={e => setServices(ss =>
                          ss.map(x => x.id === s.id ? { ...x, price: e.target.value } : x)
                        )}
                      />
                    </td>
                    <td>
                      <button className={styles.saveBtn} onClick={() => saveService(s)}>
                        Speichern
                      </button>
                      <button className={styles.deleteBtn} onClick={() => removeService(s.id)}>
                        Löschen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addService} className={styles.button}>
              Leistung hinzufügen
            </button>
          </div>

          {/* Friseure verwalten */}
          <div className={styles.subsection}>
            <h2 className={styles.title}>Friseure verwalten</h2>
            <form onSubmit={handleAddBarber} className={styles.barberForm}>
              <input
                className={styles.input}
                placeholder="Name"
                value={newBarber.full_name}
                onChange={e => setNewBarber(nb => ({ ...nb, full_name: e.target.value }))}
                required
              />
              <input
                className={styles.input}
                type="email"
                placeholder="E-Mail"
                value={newBarber.email}
                onChange={e => setNewBarber(nb => ({ ...nb, email: e.target.value }))}
                required
              />
              <input
                className={styles.input}
                type="password"
                placeholder="Passwort"
                value={newBarber.password}
                onChange={e => setNewBarber(nb => ({ ...nb, password: e.target.value }))}
                required
              />
              <button className={styles.createBtn}>Barber anlegen</button>
            </form>

            <ul className={styles.barberList}>
              {barbers.map(b => (
                <li key={b.id} className={styles.barberListItem}>
                  <span>
                    {b.full_name} {b.is_active ? "" : "(gesperrt)"}
                  </span>
                  <div className={styles.barberActions}>
                    <button
                      className={styles.lockBtn}
                      onClick={() => toggleBarberActive(b.id, !b.is_active)}
                    >
                      {b.is_active ? "Sperren" : "Entsperren"}
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => deleteBarber(b.id)}
                    >
                      Löschen
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>
    </div>
  );
}
