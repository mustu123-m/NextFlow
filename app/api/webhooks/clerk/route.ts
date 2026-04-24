import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const signingSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!signingSecret) {
    throw new Error("CLERK_WEBHOOK_SECRET is not defined");
  }

  const wh = new Webhook(signingSecret);
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  const body = await request.text();
  let evt: any;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as any;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", { status: 400 });
  }

  const { id, email_addresses, first_name } = evt.data;
  const email = email_addresses[0]?.email_address;

  // Handle user creation
  if (evt.type === "user.created") {
    try {
      await prisma.user.create({
        data: {
          clerkId: id,
          email,
          name: first_name,
        },
      });
    } catch (error) {
      console.error("Error creating user in database:", error);
    }
  }

  // Handle user deletion
  if (evt.type === "user.deleted") {
    try {
      await prisma.user.delete({
        where: { clerkId: id },
      });
    } catch (error) {
      console.error("Error deleting user from database:", error);
    }
  }

  return new NextResponse(null, { status: 200 });
}