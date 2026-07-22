import { NextResponse } from "next/server";

const KANONIK_HOST = "hukukim.com";

export function middleware(request) {
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
  matcher: ["/((?!api).*)"],
};
