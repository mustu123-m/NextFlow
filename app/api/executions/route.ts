import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { executeWorkflow } from "@/lib/execution";

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await request.json();
    const { workflowId, mode = "full", selectedNodes } = body;

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow || workflow.userId !== user.id) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // Create execution record
    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId,
        userId: user.id,
        status: "RUNNING",
      },
    });

    // Execute workflow asynchronously
    executeWorkflow(execution.id, workflow, mode, selectedNodes).catch(
      console.error
    );

    return NextResponse.json({
      executionId: execution.id,
      status: "RUNNING",
    });
  } catch (error) {
    console.error("POST /api/executions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}