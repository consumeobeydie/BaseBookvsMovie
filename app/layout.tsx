import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "BaseBookvsMovie",
  description: "Vote for your favorite book or film adaptation and earn 100 CSM tokens on Base",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="fc:frame" content='{"version":"next","imageUrl":"https://base-bookvs-movie.vercel.app/preview.png","button":{"title":"Vote Now","action":{"type":"launch_frame","name":"BaseBookvsMovie","url":"https://base-bookvs-movie.vercel.app","splashImageUrl":"https://base-bookvs-movie.vercel.app/icon.png","splashBackgroundColor":"#0a0a0f"}}}' />
        <meta name="base:app_id" content="6a2421d7ee0157745851b2b2" />
        <meta name="talentapp:project_verification" content="541866e0f694f987c8ea81b352383dda57767b3f5d5916923fcdb9541645a7e1e5f59f5998d9664b758b9680dea11bbb914c53464b4a3e76eb222a29b5bb2e25" />
      </head>
      <body className="min-h-screen bg-[#0a0a0f] text-white" style={{ height: "100dvh", overflowY: "auto" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
