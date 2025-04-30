// src/pages/BarbershopDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate }                 from "react-router-dom";
import { supabase }                    from "../supabase/client.js";
import { useAuth }                     from "../context/AuthContext.jsx";
import styles                          from "./BarbershopDashboard.module.css";

export default function BarbershopDashboard() {
  const { session } = useAuth();
  const navigate    = useNavigate();

  const [shop, setShop]                 = useState(null);
  const [shopName, setShopName]         = useState("");
  const [logoFile, setLogoFile]         = useState(null);
  const [imageFile,setImageFile]        = useState(null);
  const [logoPreview,setLogoPreview]    = useState(null);
  const [imgPreview, setImgPreview]     = useState(null);

  const [openingHours, setOpeningHours] = useState([]);
  const [services,     setServices]     = useState([]);
  const [barbers,      setBarbers]      = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const defaultHours = Array.from({ length:7 },(_,i)=>(({
    id: null, day_of_week: i+1, open_time: "", close_time: ""
  })));

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoading(true);

      const { data: shopData } = await supabase
        .from("barbershops")
        .select("*")
        .eq("owner_user_id", session.user.id)
        .maybeSingle();

      if (!shopData) {
        alert("Kein Shop gefunden – bitte anlegen");
        navigate("/register-barbershop");
        setLoading(false);
        return;
      }

      setShop(shopData);
      setShopName(shopData.name);
      setLogoPreview(shopData.logo_url);
      setImgPreview(shopData.image_url);

      await reloadHours   (shopData.id);
      await reloadServices(shopData.id);
      await reloadBarbers (shopData.id);

      setLoading(false);
    })();
  }, [session, navigate]);

  const reloadHours = async id => {
    const { data=[] } = await supabase
      .from("opening_hours").select("*")
      .eq("barbershop_id",id).order("day_of_week");
    setOpeningHours(
      defaultHours.map(d => data.find(r => r.day_of_week===d.day_of_week) ?? d)
    );
  };

  const reloadServices = async id => {
    const { data=[] } = await supabase
      .from("shop_services").select("*")
      .eq("barbershop_id",id);
    setServices(data);
  };

  const reloadBarbers = async id => {
    const { data=[] } = await supabase
      .from("barbers").select("*")
      .eq("barbershop_id",id);
    setBarbers(data);
  };

  async function saveOpeningHours(){
    if(!shop) return;
    setLoading(true);

    const payload = openingHours.map(r=>({
      id: r.id ?? undefined,
      barbershop_id: shop.id,
      day_of_week : r.day_of_week,
      open_time   : r.open_time || null,
      close_time  : r.close_time|| null
    }));

    const { error } = await supabase
      .from("opening_hours")
      .upsert(payload,{
        onConflict:["barbershop_id","day_of_week"],
        returning :"minimal"
      });

    if(error){
      console.error(error);
      setMessage("Fehler beim Speichern der Öffnungszeiten.");
    } else {
      await reloadHours(shop.id);
      setMessage("Öffnungszeiten gespeichert!");
    }
    setTimeout(()=>setMessage(""),4000);
    setLoading(false);
  }

  async function saveShopDetails(e){
    e.preventDefault();
    if(!shop) return;
    setLoading(true);

    let logo_url  = shop.logo_url;
    let image_url = shop.image_url;

    if(logoFile){
      const { data, error } = await supabase.storage
        .from("shop-logos")
        .upload(`${shop.id}/logo_${Date.now()}`,logoFile,{ upsert:true });
      if(!error){
        logo_url = supabase.storage.from("shop-logos")
                  .getPublicUrl(data.path).publicURL;
      }
    }

    if(imageFile){
      const { data, error } = await supabase.storage
        .from("shop-images")
        .upload(`${shop.id}/img_${Date.now()}`,imageFile,{ upsert:true });
      if(!error){
        image_url = supabase.storage.from("shop-images")
                   .getPublicUrl(data.path).publicURL;
      }
    }

    const { error } = await supabase
      .from("barbershops")
      .update({ name:shopName, logo_url, image_url })
      .eq("id",shop.id);

    if(error){
      console.error(error);
      setMessage("Speichern fehlgeschlagen.");
    } else {
      setShop({...shop, name:shopName, logo_url, image_url});
      setLogoFile(null); setImageFile(null);
      setMessage("Shop-Daten gespeichert!");
    }
    setTimeout(()=>setMessage(""),4000);
    setLoading(false);
  }

  async function addService(){
    const name  = prompt("Leistungsname:");
    const price = parseFloat(prompt("Preis (€):"));
    if(!name || isNaN(price)) return;

    const { data, error } = await supabase
      .from("shop_services")
      .insert({ barbershop_id:shop.id, name, price })
      .single();
    if(!error) setServices(s=>[...s,data]);
  }
  const removeService = async id =>{
    if(!confirm("Service löschen?")) return;
    const { error } = await supabase.from("shop_services").delete().eq("id",id);
    if(!error) setServices(s=>s.filter(x=>x.id!==id));
  };

  async function addBarber(){
    const full_name = prompt("Name des Barbers:");
    if(!full_name) return;
    const { data, error } = await supabase
      .from("barbers").insert({ full_name, barbershop_id:shop.id }).single();
    if(!error) setBarbers(b=>[...b,data]);
  }
  const removeBarber = async id =>{
    if(!confirm("Barber löschen?")) return;
    const { error } = await supabase.from("barbers").delete().eq("id",id);
    if(!error) setBarbers(b=>b.filter(x=>x.id!==id));
  };

  if(loading) return <p className={styles.loading}>Lade Daten…</p>;
  if(!shop)    return null;

  return (
    <div className={styles.wrapper}>
      <section className={styles.card}>

        <div className={styles.left}>
          <h1 className={styles.title}>Willkommen, {shop.name}!</h1>
          {logoPreview && <img src={logoPreview} alt="Logo" className={styles.thumbnail}/>}
          <h2 className={styles.title}>Shop-Basisdaten</h2>
          <form onSubmit={saveShopDetails} className={styles.form}>
            <label>Name
              <input className={styles.input}
                     value={shopName}
                     onChange={e=>setShopName(e.target.value)} />
            </label>
            <label>Logo
              <input type="file" accept="image/*"
                     onChange={e=>{
                       setLogoFile(e.target.files[0]);
                       setLogoPreview(URL.createObjectURL(e.target.files[0]));
                     }}/>
            </label>
            <label>Shop-Bild
              <input type="file" accept="image/*"
                     onChange={e=>{
                       setImageFile(e.target.files[0]);
                       setImgPreview(URL.createObjectURL(e.target.files[0]));
                     }}/>
            </label>
            <button className={styles.button}>Speichern</button>
          </form>
          {imgPreview && <img src={imgPreview} alt="Shop" className={styles.thumbnail}/>}
        </div>

        <div className={styles.right}>
          {message && <div className={styles.success}>{message}</div>}

          {/* Öffnungszeiten */}
          <div className={styles.subsection}>
            <h2 className={styles.title}>Öffnungszeiten</h2>

            <div className={styles.hoursGrid}>
              <div className={styles.gridHeader}>Tag</div>
              <div className={styles.gridHeader}>Öffnet</div>
              <div className={styles.gridHeader}>Schließt</div>

              {openingHours.map((h,i)=>(
                <React.Fragment key={h.day_of_week}>
                  <div className={styles.gridCell}>
                    {["Mo","Di","Mi","Do","Fr","Sa","So"][h.day_of_week-1]}
                  </div>
                  <input type="time" className={styles.timeInput}
                    value={h.open_time||""}
                    onChange={e=>{
                      const arr=[...openingHours];
                      arr[i].open_time=e.target.value;
                      setOpeningHours(arr);
                    }}/>
                  <input type="time" className={styles.timeInput}
                    value={h.close_time||""}
                    onChange={e=>{
                      const arr=[...openingHours];
                      arr[i].close_time=e.target.value;
                      setOpeningHours(arr);
                    }}/>
                </React.Fragment>
              ))}
            </div>

            <button onClick={saveOpeningHours} className={styles.button}>
              Öffnungszeiten speichern
            </button>
          </div>

          <div className={styles.subsection}>
            <h2 className={styles.title}>Leistungen & Preise</h2>
            <ul className={styles.list}>
              {services.map(s=>(
                <li key={s.id}>
                  {s.name} — {s.price} €
                  <button onClick={()=>removeService(s.id)} className={styles.removeBtn}>✕</button>
                </li>
              ))}
            </ul>
            <button onClick={addService} className={styles.button}>Leistung hinzufügen</button>
          </div>

          <div className={styles.subsection}>
            <h2 className={styles.title}>Friseure</h2>
            <ul className={styles.list}>
              {barbers.map(b=>(
                <li key={b.id}>
                  {b.full_name}
                  <button onClick={()=>removeBarber(b.id)} className={styles.removeBtn}>✕</button>
                </li>
              ))}
            </ul>
            <button onClick={addBarber} className={styles.button}>Barber hinzufügen</button>
          </div>
        </div>
      </section>
    </div>
  );
}
