import { NextResponse } from "next/server";

const KANONIK_HOST = "hukukim.com";

function corsBasliklariEkle(response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export function middleware(request) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    if (request.method === "OPTIONS") {
      return corsBasliklariEkle(new NextResponse(null, { status: 204 }));
    }
    return corsBasliklariEkle(NextResponse.next());
  }

  const host = request.headers.get("host") ?? "";

  if (host.endsWith("vercel.app")) {
    const url = new URL(request.url);
    url.protocol = "https";
    url.host = KANONIK_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
