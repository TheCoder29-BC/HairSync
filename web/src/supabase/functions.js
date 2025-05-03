// src/supabase/functions.js
import { supabase } from "./client.js";

export async function invokeFunction(fnName, payload) {
  // 1) versuche die eingebaute Invoke-Methode
  const { data, error } = await supabase.functions.invoke(fnName, { body: payload });
  if (!error) return data;

  // 2) Fallback per fetch (mit apikey-Header)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  const url   = `${import.meta.env.VITE_SUPABASE_URL.replace(/^https?:\/\//, "")}/functions/v1/${fnName}`;

  const res = await fetch(`https://${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}
