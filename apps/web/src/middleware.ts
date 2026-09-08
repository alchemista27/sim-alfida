import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const res = await fetch(new URL("/api/auth/get-session", request.url).toString(), {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  const session = res.ok ? await res.json() : null;
  const user = session?.user;

  if (pathname === "/") {
    if (user) {
      return NextResponse.redirect(new URL("/modules", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!user && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isPublicRoute) {
    return NextResponse.redirect(new URL("/modules", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
