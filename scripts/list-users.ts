import { clerkClient } from "@clerk/nextjs/server";

async function main() {
  const client = await clerkClient();
  const list = await client.users.getUserList();
  console.log("Clerk users found:", list.data.map(u => ({ id: u.id, email: u.emailAddresses.map(e => e.emailAddress) })));
}

main().catch(console.error);
