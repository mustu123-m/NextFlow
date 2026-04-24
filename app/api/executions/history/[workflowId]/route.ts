import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workflow = await prisma.workflow.findUnique({
      where: { id: params.workflowId },
    });

    if (!workflow || workflow.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const executions = await prisma.workflowExecution.findMany({
      where: { workflowId: params.workflowId },
      include: { nodeExecutions: true },
      orderBy: { startedAt: "desc" },
      take: 50,
    });

    return NextResponse.json(executions);
  } catch (error) {
    console.error("GET /api/executions/history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}