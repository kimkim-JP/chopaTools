import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  const priceId = process.env.STRIPE_PRICE_ID_STARTER;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!priceId) {
    return NextResponse.json(
      { error: "STRIPE_PRICE_ID_STARTER is not configured." },
      { status: 500 }
    );
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/?checkout=success`,
    cancel_url: `${appUrl}/?checkout=cancelled`,
    metadata: {
      product: "line-stamp-pack"
    }
  });

  return NextResponse.json({ url: session.url });
}
