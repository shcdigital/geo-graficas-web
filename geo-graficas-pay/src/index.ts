export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/checkout" && request.method === "POST") {
      return handleCheckout(request, env);
    }

    if (url.pathname === "/webhook" && request.method === "POST") {
      return handleWebhook(request, env);
    }

    return new Response("Not Found", { status: 404 });
  },
};

async function handleCheckout(request: Request, env: any): Promise<Response> {
  try {
    const body = await request.json();
    const { items } = body; // Expected: [{ slug: "...", quantity: 1 }]

    // TODO: Fetch prices and fileIds from a mapping
    // For now, we'll assume a simple structure
    let total = 0;
    const preferenceItems = items.map((item: any) => {
      const price = 100; // Placeholder
      total += price * item.quantity;
      return {
        title: item.slug,
        quantity: item.quantity,
        unit_price: {
          value: price,
          currency_code: "ARS",
        },
      };
    });

    const mpResponse = await fetch("https://api.mercadopago.com/preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: preferenceItems,
        payer: {
          display_name: "Geo Gráficas",
          email: "customer@example.com",
        },
        back_url: "https://geo-graficas-web-d6a153.gitlab.io/checkout/success",
        success_url: "https://geo-graficas-web-d6a153.gitlab.io/checkout/success",
        failure_url: "https://geo-graficas-web-d6a153.gitlab.io/checkout/success",
      }),
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      return new Response(JSON.stringify(data), {
        status: mpResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleWebhook(request: Request, env: any): Promise<Response> {
  // TODO: Validate signature with env.MP_WEBHOOK_SECRET
  // TODO: Process payment status and save to KV
  return new Response("Webhook received", { status: 200 });
}
