"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  OnSelectionChangeParams,
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
  onNodeSelectForExecution?: (nodeIds: string[]) => void;
  selectedForExecution?: string[];
}

export default function WorkflowCanvas({
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeDelete,
  onNodeSelect,
  onNodeSelectForExecution,
  selectedForExecution = [],
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
    // ✅ Relative container so the badge can be positioned inside
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={initialNodes}   // ✅ pass original nodes directly — no spread/annotation
        edges={initialEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={memoizedNodeTypes}
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        onSelectionChange={(params: OnSelectionChangeParams) => {
          // ✅ Pass the selected node IDs up — guard against loops is in the parent
          onNodeSelectForExecution?.(params.nodes.map((n) => n.id));
        }}
        onNodeClick={(_, node) => {
          onNodeSelect?.(node.id);
        }}
        onPaneClick={() => {
          onNodeSelect?.(null);
          onNodeSelectForExecution?.([]);
        }}
        deleteKeyCode="Delete"
        className="bg-slate-50 dark:bg-slate-900"
      >
        <Background color="#e2e8f0" style={{ backgroundColor: "#f8fafc" }} gap={16} />
        <Controls position="bottom-left" />
        <MiniMap position="bottom-right" />

        {/* Empty State */}
        {initialNodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-slate-400 text-lg font-medium">Add a node</p>
            <p className="text-slate-400 text-sm mt-1">
              Click + to add · Click to select · Ctrl+click to multi-select
            </p>
          </div>
        )}
      </ReactFlow>

      {/* ✅ Selection badge — outside ReactFlow so it doesn't affect node data */}
      {selectedForExecution.length > 0 && (
        <div className="absolute top-4 right-4 z-10 bg-green-500 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow pointer-events-none select-none">
          {selectedForExecution.length} node{selectedForExecution.length > 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}