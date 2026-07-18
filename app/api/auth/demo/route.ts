import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    if (process.env.MOCK_AUTH === "true") {
      const cookieStore = await cookies();
      cookieStore.set("mock_session", "active", { path: "/" });
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const client = await clerkClient();
    const ticket = await client.signInTokens.createSignInToken({
      userId: "user_3Gf78YL6ntovOyXcyjv1pi2OlEt",
      expiresInSeconds: 60,
    });
    
    return NextResponse.redirect(ticket.url);
  } catch (error) {
    console.error("Failed to generate demo token:", error);
    return NextResponse.json({ error: "Failed to initialize demo session." }, { status: 500 });
  }
}
