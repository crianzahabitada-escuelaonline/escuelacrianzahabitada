import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  try {
    const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
    if (!MP_ACCESS_TOKEN) throw new Error("MP_ACCESS_TOKEN no configurado");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { type, data: notifData } = body;

    if (type === "payment") {
      // Fetch payment details from Mercado Pago
      const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${notifData.id}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      });
      const payment = await paymentRes.json();

      if (payment.status === "approved") {
        const userId = payment.external_reference;
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await supabase.from("subscriptions").upsert({
          user_id: userId,
          status: "active",
          plan: "monthly",
          price_usd: 97,
          mp_payer_id: payment.payer?.id?.toString() || "",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        }, { onConflict: "user_id" });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("mp-webhook error:", error);
    return new Response("OK", { status: 200 });
  }
});
