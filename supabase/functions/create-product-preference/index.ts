import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { user_id, email, product_id, product_title, product_price } = await req.json();
    if (!user_id || !email || !product_id || !product_title || !product_price) {
      throw new Error("Faltan campos requeridos");
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from("product_purchases")
      .insert({
        user_id,
        product_id,
        amount: product_price,
        status: "pending",
      })
      .select("id")
      .single();

    if (purchaseError) throw new Error("Error creando compra: " + purchaseError.message);

    const origin = req.headers.get("origin") || "https://escuelacrianzahabitada.lovable.app";

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: product_title,
            quantity: 1,
            unit_price: Number(product_price),
            currency_id: "USD",
          },
        ],
        payer: { email },
        back_urls: {
          success: `${origin}/ebooks?status=success&purchase=${purchase.id}`,
          failure: `${origin}/ebooks?status=failure`,
          pending: `${origin}/ebooks?status=pending`,
        },
        auto_return: "approved",
        notification_url: `${supabaseUrl}/functions/v1/mp-product-webhook`,
        metadata: { user_id, product_id, purchase_id: purchase.id },
        external_reference: purchase.id,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Mercado Pago error: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ init_point: data.init_point }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    console.error("create-product-preference error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
