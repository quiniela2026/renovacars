// Supabase Edge Function — envía notificación push vía OneSignal
// Deploy: supabase functions deploy send-notification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID")!
const ONESIGNAL_API_KEY = Deno.env.get("ONESIGNAL_API_KEY")!

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { external_id, title, message, url } = await req.json()

    if (!external_id || !title || !message) {
      return new Response(JSON.stringify({ error: "Faltan parámetros" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_aliases: { external_id: [external_id] },
        target_channel: "push",
        headings: { en: title, es: title },
        contents: { en: message, es: message },
        url: url || undefined,
      }),
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
