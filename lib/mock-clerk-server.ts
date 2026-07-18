import { NextResponse } from "next/server";

export async function auth() {
  return {
    userId: "user_3Gf78YL6ntovOyXcyjv1pi2OlEt",
    protect: () => {},
  };
}

export async function currentUser() {
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
  };
}

export function createRouteMatcher() {
  return () => false;
}

export function clerkMiddleware(_handler?: any) {
  return async (req: any, _event?: any) => {
    if (req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  };
}
