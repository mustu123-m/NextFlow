"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
} from "reactflow";
import { useMemo } from "react";
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

  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  return (
    <ReactFlow
      nodes={initialNodes}
      edges={initialEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={handleConnect}
      nodeTypes={memoizedNodeTypes}
      fitView
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      onNodeClick={(event, node) => onNodeSelect?.(node.id)}
      onPaneClick={() => onNodeSelect?.(null)}
      deleteKeyCode="Delete"
      className="bg-slate-50 dark:bg-slate-900"
    >
      <Background color="#e2e8f0" style={{ backgroundColor: "#f8fafc" }} gap={16} />
      <Controls position="bottom-left" />
   

      {/* Empty State */}
      {initialNodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-slate-400 text-lg font-medium">Add a node</p>
          <p className="text-slate-400 text-sm mt-1">Double click, right click, or press N</p>
        </div>
      )}
    </ReactFlow>
  );
}