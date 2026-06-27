import { NextRequest, NextResponse } from "next/server";
import { parseUnits } from "viem";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const PAYMENT_AMOUNT = parseUnits("0.01", 6);
const PAYMENT_RECIPIENT = "0xcAaDa98159b82b80D7940CFb527f7Ab44E650Cc8";

export async function GET(request: NextRequest) {
  const paymentHeader = request.headers.get("X-PAYMENT");

  if (!paymentHeader) {
    return NextResponse.json(
      {
        x402Version: 1,
        accepts: [{
          scheme: "exact",
          network: "base",
          maxAmountRequired: PAYMENT_AMOUNT.toString(),
          resource: `${request.nextUrl.origin}/api/last-vote-access`,
          description: "Final vote access for BaseBookvsMovie - $0.01 USDC",
          mimeType: "application/json",
          payTo: PAYMENT_RECIPIENT,
          maxTimeoutSeconds: 300,
          asset: USDC_ADDRESS,
          extra: { name: "BaseBookvsMovie", version: "1.0" }
        }],
        error: "Payment required"
      },
      { status: 402 }
    );
  }

  try {
    const facilitatorUrl = "https://x402.org/facilitator";
    const requirements = {
      scheme: "exact",
      network: "base",
      maxAmountRequired: PAYMENT_AMOUNT.toString(),
      resource: `${request.nextUrl.origin}/api/last-vote-access`,
      description: "Final vote access",
      mimeType: "application/json",
      payTo: PAYMENT_RECIPIENT,
      maxTimeoutSeconds: 300,
      asset: USDC_ADDRESS,
    };

    const verifyRes = await fetch(`${facilitatorUrl}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ x402Version: 1, paymentHeader, requirements })
    });

    const verifyData = await verifyRes.json();
    if (!verifyData.isValid) {
      return NextResponse.json({ error: "Invalid payment" }, { status: 402 });
    }

    await fetch(`${facilitatorUrl}/settle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ x402Version: 1, paymentHeader, requirements })
    });

    return NextResponse.json({ granted: true });
  } catch {
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 });
  }
}