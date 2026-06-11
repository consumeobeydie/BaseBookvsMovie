import { NextResponse } from "next/server";

export async function GET() {
  const appUrl = "https://base-bookvs-movie.vercel.app";

  return NextResponse.json({
    accountAssociation: {
      header: "eyJmaWQiOjQ0OTE0MCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDdhNUYxM2VGY0I4RDc1QTNCNEI1NUQzNmRBRTUyRTQ1N2I4ZDc1NTkifQ",
      payload: "eyJkb21haW4iOiJiYXNlLWJvb2t2cy1tb3ZpZS52ZXJjZWwuYXBwIn0",
      signature: "8Y1JgQb6k6d3qZz/XEQIrtxPvjoCbxae0HhDqOooR3V1Wab1ko8q+DcfCtUhkV7/T3E9mjcYBbyAjDIlmDkKjxs=",
    },
    frame: {
      version: "1",
      name: "BaseBookvsMovie",
      subtitle: "Book vs Film voting on Base",
      description: "Vote for your favorite book or film adaptation and earn 100 CSM tokens",
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/preview.png`,
      splashImageUrl: `${appUrl}/icon.png`,
      splashBackgroundColor: "#0a0a0f",
      primaryCategory: "social",
      tags: ["voting", "books", "movies", "base", "csm"],
      tagline: "Book or Film? You decide!",
      heroImageUrl: `${appUrl}/preview.png`,
      screenshotUrls: [`${appUrl}/preview.png`],
      ogTitle: "BaseBookvsMovie",
      ogDescription: "Vote for your favorite book or film adaptation and earn CSM tokens",
      ogImageUrl: `${appUrl}/preview.png`,
    },
  });
}