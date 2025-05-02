// functions/create-barber/index.ts
import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

// Supabase-Admin-Client mit deinem Service Role Key
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!, 
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// CORS-Header, passe Origin ggf. an
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "http://localhost:5173", // oder "*" für alle Origins
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // 1) OPTIONS / Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  // 2) JSON Body parsen
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ message: "Invalid JSON" }),
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { full_name, email, password, barbershop_id } = body;
  if (!full_name || !email || !password || !barbershop_id) {
    return new Response(
      JSON.stringify({ message: "Missing parameters" }),
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    // 3) Supabase Auth: neuer User
    const { data: user, error: ue } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "barber" },
    });
    if (ue || !user.id) {
      throw ue ?? new Error("No user returned");
    }

    // 4) Datensatz in deiner "barbers"-Tabelle anlegen
    const { data: barber, error: de } = await supabaseAdmin
      .from("barbers")
      .insert({
        full_name,
        email,
        user_id: user.id,
        barbershop_id,
      })
      .select("id, full_name, user_id, is_active")
      .single();
    if (de) throw de;

    // 5) Erfolgreiche Antwort
    return new Response(JSON.stringify(barber), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    console.error(err);
    return new Response(
      JSON.stringify({ message: err.message || "Internal error" }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
});
