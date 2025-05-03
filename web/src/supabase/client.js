// src/supabase/client.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '❌ Missing env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required'
  )
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('→ SUPABASE_URL     =', SUPABASE_URL)
console.log('→ SUPABASE_ANON_KEY=', SUPABASE_ANON_KEY)

/**
 * Wrapper, der Anfragen an deine lokal (via Vite-Proxy) oder remote
 * (über /api/<functionName>) weiterleitet.
 * Standardmäßig POST mit JSON-Body.
 */
export async function callEdgeFunction(functionName, { body, headers = {}, method = 'POST' } = {}) {
  // 1) Versuch: supabase.functions.invoke (wenn client.js korrekt konfiguriert ist)
  try {
    const { data, error } = await supabase.functions.invoke(functionName, { body })
    if (!error) return { data }
    console.warn('supabase.functions.invoke failed, falling back to fetch:', error.message)
  } catch {
    /* ignore */
  }

  // 2) Fallback: über fetch (nutzt Vite-Proxy auf /api)
  const res = await fetch(`/api/${functionName}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,         // zwingend für direkten Aufruf
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    return { error: new Error(`HTTP ${res.status}: ${text}`) }
  }
  const data = await res.json()
  return { data }
}
