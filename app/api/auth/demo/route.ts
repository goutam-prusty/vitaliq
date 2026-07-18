import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clerkClient();
    
    // user_3Gf78YL6ntovOyXcyjv1pi2OlEt is the actual Clerk user ID for the demo profile
    const ticket = await client.signInTokens.createSignInToken({
      userId: "user_3Gf78YL6ntovOyXcyjv1pi2OlEt",
      expiresInSeconds: 60,
    });
    
    // Redirect the user to the Clerk-generated URL which automatically logs them in
    return NextResponse.redirect(ticket.url);
  } catch (error) {
    console.error("Failed to generate demo token:", error);
    return NextResponse.json({ error: "Failed to initialize demo session." }, { status: 500 });
  }
}
