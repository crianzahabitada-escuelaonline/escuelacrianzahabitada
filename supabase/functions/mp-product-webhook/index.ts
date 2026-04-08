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
      const paymentRes = await fetch(
        `https://api.mercadopago.com/v1/payments/${notifData.id}`,
        { headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` } }
      );
      const payment = await paymentRes.json();

      if (payment.status === "approved") {
        const purchaseId = payment.external_reference;

        await supabase
          .from("product_purchases")
          .update({
            status: "approved",
            mp_payment_id: String(notifData.id),
            updated_at: new Date().toISOString(),
          })
          .eq("id", purchaseId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("mp-product-webhook error:", error);
    return new Response("OK", { status: 200 });
  }
});
