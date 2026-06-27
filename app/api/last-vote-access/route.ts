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

  return NextResponse.json({ granted: true });
}