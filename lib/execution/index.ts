import { prisma } from "@/lib/prisma";
import { Node, Edge } from "reactflow";
import { NodeData } from "@/lib/types";
import { calculateExecutionOrder } from "@/lib/utils/validation";
import { executeNode } from "./nodes";

export async function executeWorkflow(
  executionId: string,
  workflow: any,
  mode: string = "full",
  selectedNodes: string[] = []
) {
  try {
    const nodes: Node<NodeData>[] = workflow.nodes;
    const edges: Edge[] = workflow.edges;

    // Get execution order
    const executionOrder = calculateExecutionOrder(nodes, edges);

    // Filter nodes if selective execution
    const nodesToExecute =
      mode === "selected" ? executionOrder.filter((id) => selectedNodes.includes(id)) : executionOrder;

    // Create node executions
    const nodeExecutions: Record<string, string> = {};
    for (const nodeId of nodesToExecute) {
      const execution = await prisma.nodeExecution.create({
        data: {
          executionId,
          nodeId,
          nodeType: nodes.find((n) => n.id === nodeId)?.data?.type || "unknown",
          status: "PENDING",
        },
      });
      nodeExecutions[nodeId] = execution.id;
    }

    // Execute nodes in order
    const outputs: Record<string, any> = {};
    const nodeResults: Record<string, any> = {};

    for (const nodeId of nodesToExecute) {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) continue;

      const nodeExecId = nodeExecutions[nodeId];

      try {
        // Update status to RUNNING
        await prisma.nodeExecution.update({
          where: { id: nodeExecId },
          data: { status: "RUNNING", startedAt: new Date() },
        });

        // Collect inputs from connected nodes
        const inputs: Record<string, any> = {};
        edges.forEach((edge) => {
          if (edge.target === nodeId) {
            const sourceOutput = outputs[edge.source];
            inputs[edge.targetHandle || "default"] = sourceOutput;
          }
        });

        // Execute node
        const startTime = Date.now();
        const result = await executeNode(node as any, inputs);
        const duration = Date.now() - startTime;

        outputs[nodeId] = result.output;
        nodeResults[nodeId] = result;

        // Update node execution with success
        await prisma.nodeExecution.update({
          where: { id: nodeExecId },
          data: {
            status: "SUCCESS",
            output: result.output,
            completedAt: new Date(),
            duration,
          },
        });
      } catch (error) {
        // Update node execution with failure
        await prisma.nodeExecution.update({
          where: { id: nodeExecId },
          data: {
            status: "FAILED",
            error: error instanceof Error ? error.message : "Unknown error",
            completedAt: new Date(),
          },
        });
      }
    }

    // Determine overall status
    const allNodeExecs = await prisma.nodeExecution.findMany({
      where: { executionId },
    });

    const failedCount = allNodeExecs.filter((n) => n.status === "FAILED").length;
    const status = failedCount === 0 ? "SUCCESS" : failedCount === allNodeExecs.length ? "FAILED" : "PARTIAL";

    // Update workflow execution
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Workflow execution failed:", error);
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: "FAILED",
        completedAt: new Date(),
      },
    });
  }
}