import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function isSessionActive(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("mock_session")?.value === "active";
  } catch {
    return false;
  }
}

export async function auth() {
  const active = await isSessionActive();
  return {
    userId: active ? "user_3Gf78YL6ntovOyXcyjv1pi2OlEt" : null,
    protect: () => {
      if (!active) {
        throw new Error("Unauthorized");
      }
    },
  };
}

export async function currentUser() {
  const active = await isSessionActive();
  if (!active) return null;
  return {
    id: "user_3Gf78YL6ntovOyXcyjv1pi2OlEt",
    firstName: "Raj",
    lastName: "Shamani",
    emailAddresses: [{ emailAddress: "rajshamani@gmail.com" }],
  };
}

export async function clerkClient() {
  return {
    users: {
      getUser: async () => ({
        id: "user_3Gf78YL6ntovOyXcyjv1pi2OlEt",
        firstName: "Raj",
        lastName: "Shamani",
      }),
    },
    signInTokens: {
      createSignInToken: async () => ({
        url: "/api/auth/demo?callback=true",
      })
    }
  };
}

export function createRouteMatcher(routes: string[]) {
  return (req: any) => {
    const pathname = req.nextUrl.pathname;
    return routes.some(route => {
      if (route === "/" && pathname === "/") return true;
      if (route.endsWith("(.*)")) {
        const prefix = route.replace("(.*)", "");
        return pathname.startsWith(prefix);
      }
      return route === pathname;
    });
  };
}

export function clerkMiddleware(handler?: any) {
  return async (req: any, event?: any) => {
    const active = await isSessionActive();
    const pathname = req.nextUrl.pathname;

    const isPublic = 
      pathname === "/" ||
      pathname.startsWith("/sign-in") ||
      pathname.startsWith("/sign-up") ||
      pathname.startsWith("/api/") ||
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml" ||
      pathname === "/manifest.json" ||
      pathname === "/icon.svg" ||
      pathname === "/opengraph-image.jpg" ||
      pathname === "/dashboard-preview.png";

    if (pathname === "/" && active) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (!isPublic && !active) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (handler) {
      const authFn = Object.assign(
        async () => ({
          userId: active ? "user_3Gf78YL6ntovOyXcyjv1pi2OlEt" : null,
          protect: () => {
            if (!active) throw new Error("Unauthorized");
          }
        }),
        {
          protect: () => {
            if (!active) throw new Error("Unauthorized");
          }
        }
      );
      return handler(authFn, req, event);
    }

    return NextResponse.next();
  };
}
