import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Ensure user exists in database
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    // This shouldn't happen if Clerk webhook is set up, but fallback
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: "",
      },
    });
  }

  return <>{children}</>;
}