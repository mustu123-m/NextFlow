"use client";

import { Node, Edge } from "reactflow";
import { NodeData } from "@/lib/types";

export function exportWorkflow(
  nodes: Node<NodeData>[],
  edges: Edge[],
  name: string
) {
  const workflow = {
    version: "1.0.0",
    name,
    exportedAt: new Date().toISOString(),
    nodes,
    edges,
  };

  const dataStr = JSON.stringify(workflow, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importWorkflow(data: any): {
  nodes: Node<NodeData>[];
  edges: Edge[];
} {
  if (!data.nodes || !data.edges) {
    throw new Error("Invalid workflow format");
  }
  return {
    nodes: data.nodes,
    edges: data.edges,
  };
}