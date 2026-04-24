"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import { nodeTypes } from "@/components/nodes/NodeTypes";
import { Node, Edge, NodeChange, EdgeChange } from "reactflow";
import { NodeData } from "@/lib/types";
import { validateDAG, validateConnections } from "@/lib/utils/validation";
import toast from "react-hot-toast";

interface WorkflowCanvasProps {
  initialNodes: Node<NodeData>[];
  initialEdges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeDelete?: (nodeId: string) => void;
  onNodeSelect?: (nodeId: string | null) => void;
}

export default function WorkflowCanvas({
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeDelete,
  onNodeSelect,
}: WorkflowCanvasProps) {
  const handleConnect = (connection: Connection) => {
    const newEdges = [...initialEdges, connection as any];
    const errors = validateConnections(initialNodes, newEdges);

    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    if (!validateDAG(initialNodes, newEdges)) {
      toast.error("Connection would create a circular dependency");
      return;
    }

    onConnect(connection);
    toast.success("Connection created");
  };

  return (
    <ReactFlow
      nodes={initialNodes}
      edges={initialEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={handleConnect}
      nodeTypes={nodeTypes}
      fitView
      onNodeClick={(event, node) => onNodeSelect?.(node.id)}
      onPaneClick={() => onNodeSelect?.(null)}
      deleteKeyCode="Delete"
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}