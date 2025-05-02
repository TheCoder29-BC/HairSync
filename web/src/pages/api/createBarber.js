// pages/api/createBarber.js
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  // URL aus NEXT_PUBLIC_SUPABASE_URL
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  // Service-Role-Key aus SUPABASE_SERVICE_ROLE_KEY
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { full_name, email, password, barbershop_id } = req.body;

  try {
    // 1) Erstelle den Auth-User im Admin-Modus
    const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "barber" },
    });
    if (userErr) throw userErr;

    // 2) Lege den Barber-Datensatz an
    const { data, error: dbErr } = await supabaseAdmin
      .from("barbers")
      .insert({
        full_name,
        email,
        user_id:       userData.id,
        barbershop_id,
      })
      .select("id, full_name, user_id, is_active")
      .single();
    if (dbErr) throw dbErr;

    return res.status(200).json(data);
  } catch (err) {
    console.error("createBarber API error:", err);
    return res.status(500).json({ message: err.message });
  }
}
