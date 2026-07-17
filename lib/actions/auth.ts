"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { UserRepository } from "@/core/repositories/UserRepository";

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const userRepo = new UserRepository();
  
  // 1. Check if user already exists in the database
  try {
    const existingUser = await userRepo.findById(userId);
    if (existingUser) return existingUser;
  } catch (err) {
    console.warn("Failed checking user existence, attempting sync anyway...", err);
  }

  // 2. Fetch details from Clerk to sync if user does not exist
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;
  const displayName = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();

  // 3. Sync user and provision defaults
  try {
    return await userRepo.syncNewUser({
      id: userId,
      email,
      display_name: displayName || email || "User",
    });
  } catch (err) {
    console.error("Critical error in syncUser action:", err);
    throw err;
  }
}
