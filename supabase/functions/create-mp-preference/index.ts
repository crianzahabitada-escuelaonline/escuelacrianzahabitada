import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
    if (!MP_ACCESS_TOKEN) throw new Error("MP_ACCESS_TOKEN no configurado");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, email } = await req.json();
    if (!user_id || !email) throw new Error("user_id y email son requeridos");

    // Create Mercado Pago preference
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: "Membresía Escuela Crianza Habitada - Mensual",
            quantity: 1,
            unit_price: 97,
            currency_id: "USD",
          },
        ],
        payer: { email },
        back_urls: {
          success: `${req.headers.get("origin") || "https://escuelacrianzahabitada.lovable.app"}/membresia?status=success`,
          failure: `${req.headers.get("origin") || "https://escuelacrianzahabitada.lovable.app"}/membresia?status=failure`,
          pending: `${req.headers.get("origin") || "https://escuelacrianzahabitada.lovable.app"}/membresia?status=pending`,
        },
        auto_return: "approved",
        notification_url: `${supabaseUrl}/functions/v1/mp-webhook`,
        metadata: { user_id },
        external_reference: user_id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Mercado Pago error: ${JSON.stringify(data)}`);
    }

    // Create pending subscription
    await supabase.from("subscriptions").upsert({
      user_id,
      status: "pending",
      plan: "monthly",
      price_usd: 97,
      mp_subscription_id: data.id,
    }, { onConflict: "user_id" });

    return new Response(JSON.stringify({ init_point: data.init_point }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    console.error("create-mp-preference error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
