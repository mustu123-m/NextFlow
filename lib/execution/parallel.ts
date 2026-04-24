import { Node, Edge } from "reactflow";
import { NodeData } from "@/lib/types";
import { calculateExecutionOrder } from "@/lib/utils/validation";

export interface ExecutionGroup {
  level: number;
  nodeIds: string[];
}

export function calculateExecutionLevels(
  nodes: Node<NodeData>[],
  edges: Edge[]
): ExecutionGroup[] {
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize
  nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  // Build graph
  edges.forEach((edge) => {
    const targets = adjacencyList.get(edge.source) || [];
    targets.push(edge.target);
    adjacencyList.set(edge.source, targets);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  const levels: ExecutionGroup[] = [];
  const queue: string[] = [];
  const processedNodes = new Set<string>();

  // Start with nodes that have no dependencies
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId);
  });

  let level = 0;

  while (queue.length > 0) {
    const levelNodes = [...queue];
    queue.length = 0;

    levels.push({
      level,
      nodeIds: levelNodes,
    });

    levelNodes.forEach((nodeId) => {
      processedNodes.add(nodeId);
      (adjacencyList.get(nodeId) || []).forEach((neighbor) => {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 1) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      });
    });

    level++;
  }

  return levels;
}