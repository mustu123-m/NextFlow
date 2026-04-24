"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { nodeTypes } from "@/components/nodes/NodeTypes";
import { Node, Edge } from "reactflow";
import { NodeData } from "@/lib/types";
import { validateDAG, validateConnections } from "@/lib/utils/validation";
import toast from "react-hot-toast";

interface WorkflowCanvasProps {
  initialNodes: Node<NodeData>[];
  initialEdges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (connection: Connection) => void;
  onNodeDelete?: (nodeId: string) => void;
  onNodeSelect?: (nodeId: string | null) => void;
  onAddNode?: (type: string) => void;
}

export default function WorkflowCanvas({
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeDelete,
  onNodeSelect,
  onAddNode,
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
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDrop={(event) => {
        event.preventDefault();
        const nodeType = event.dataTransfer.getData("application/reactflow");
        if (nodeType && onAddNode) {
          onAddNode(nodeType);
        }
      }}
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}