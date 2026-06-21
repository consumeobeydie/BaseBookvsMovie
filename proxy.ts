import { paymentMiddleware } from "x402-next";
import { facilitator } from "@coinbase/x402";

const proxy = paymentMiddleware(
  "0xcAaDa98159b82b80D7940CFb527f7Ab44E650Cc8",
  {
    "/api/last-vote-access": {
      price: "$0.01",
      network: "base",
      config: {
        description: "Final vote access for BaseBookvsMovie",
      },
    },
  },
  facilitator
);

export default proxy;

export const config = {
  matcher: ["/api/last-vote-access"],
};
