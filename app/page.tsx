import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold">NextProd</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          LLM-Powered Workflow Builder
        </p>
        <p className="mt-4 max-w-md text-gray-400">
          Create powerful automation workflows with AI. Drag, connect, and run.
        </p>
      </div>

      <div className="flex gap-4">
        <Link href="/sign-in">
          <Button>Sign In</Button>
        </Link>
        <Link href="/sign-up">
          <Button variant="outline">Sign Up</Button>
        </Link>
      </div>
    </div>
  );
}