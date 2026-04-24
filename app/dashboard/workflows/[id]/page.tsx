"use client";

import { useState, useEffect, useCallback ,useRef} from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import WorkflowCanvas from "@/components/workflow/WorkflowCanvas";
import Sidebar from "@/components/workflow/Sidebar";
import HistoryPanel from "@/components/workflow/HistoryPanel";
import ToolbarActions from "@/components/workflow/ToolbarActions";
import ValidationPanel from "@/components/workflow/ValidationPanel";
import { useExecution } from "@/lib/hooks/useExecution";
import { useWorkflowStore } from "@/lib/store/workflowStore";
import { exportWorkflow, importWorkflow } from "@/components/workflow/WorkflowExportImport";
import { Play, Save, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { Node, NodeChange, EdgeChange, Connection } from "reactflow";
import { NodeData } from "@/lib/types";
import * as api from "@/lib/utils/api";

export default function WorkflowEditorPage() {
  const params = useParams();
  const workflowId = params.id as string;
   const nodeCounterRef = useRef(0);
  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    deleteNode: deleteStoreNode,
    addNode: addStoreNode,
    addEdge: addStoreEdge,
    selectNode,
    saveToHistory,
    reset,
  } = useWorkflowStore();

  const { executeWorkflow } = useExecution();

  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load workflow on mount
  useEffect(() => {
    const load = async () => {
      if (!workflowId) return;
      setLoading(true);
      try {
        const workflow = await api.getWorkflow(workflowId);
        setWorkflowName(workflow.name || "Untitled Workflow");
        setStoreNodes(workflow.nodes || []);
        setStoreEdges(workflow.edges || []);
      } catch (error) {
        toast.error("Failed to load workflow");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workflowId, setStoreNodes, setStoreEdges]);
  // DEBUG: Log store nodes
useEffect(() => {
  console.log("❌ DEBUG PAGE - Store nodes:", storeNodes);
  console.log("❌ DEBUG PAGE - Nodes length:", storeNodes.length);
  storeNodes.forEach((node, i) => {
    console.log(`  Node ${i}:`, node.id, node.type, node.data?.type);
  });
}, [storeNodes]);

  // Handle node position changes when dragging
const onNodesChange = useCallback((changes: NodeChange[]) => {
  setStoreNodes((prevNodes) => {
    const updated = [...prevNodes];
    changes.forEach((change) => {
      const index = updated.findIndex((n) => n.id === change.id);
      if (index !== -1) {
        if (change.type === "position" && change.position) {
          updated[index].position = change.position;
        } else if (change.type === "select") {
          updated[index].selected = change.selected;
        } else if (change.type === "remove") {
          updated.splice(index, 1);
        }
      }
    });
    return updated;
  });
}, [setStoreNodes]);

  // Handle edge changes
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setStoreEdges((prevEdges) => {
      let updated = [...prevEdges];
      changes.forEach((change) => {
        if (change.type === "remove") {
          updated = updated.filter((e) => e.id !== change.id);
        }
      });
      return updated;
    });
  }, [setStoreEdges]);

  // Handle new connections
  const onConnect = useCallback((connection: Connection) => {
    const newEdge = {
      ...connection,
      id: `edge-${Date.now()}`,
    };
    addStoreEdge(newEdge);
  }, [addStoreEdge]);

  // Add new node from sidebar
const handleAddNode = (type: string) => {
    nodeCounterRef.current += 1;
    const uniqueId = `${type}-${Date.now()}-${nodeCounterRef.current}`;
    
    const newNode: Node<NodeData> = {
      id: uniqueId,
      data: {
        id: uniqueId,
        type: type as any,
        label: type.charAt(0).toUpperCase() + type.slice(1),
      },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      type: type,
      draggable: true,
    };

    addStoreNode(newNode);
     setTimeout(() => {
    saveToHistory();
  }, 0);
    toast.success(`${type} node added`);
  };

  // Delete node
  const handleDeleteNode = (id: string) => {
    deleteStoreNode(id);
    saveToHistory();
    toast.success("Node deleted");
  };

  // Save workflow
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateWorkflow(workflowId, {
        name: workflowName,
        nodes: storeNodes,
        edges: storeEdges,
      });
      saveToHistory();
      toast.success("Workflow saved");
    } catch (error) {
      toast.error("Failed to save workflow");
    } finally {
      setIsSaving(false);
    }
  };

  // Execute workflow
  const handleExecute = async () => {
    if (storeNodes.length === 0) {
      toast.error("Add nodes to your workflow first");
      return;
    }

    setIsExecuting(true);
    try {
      await handleSave();
      await executeWorkflow(workflowId, "full");
      toast.success("Workflow execution started");
    } catch (error) {
      toast.error("Failed to execute workflow");
    } finally {
      setIsExecuting(false);
    }
  };

  // Export workflow
  const handleExport = () => {
    exportWorkflow(storeNodes, storeEdges, workflowName);
    toast.success("Workflow exported");
  };

  // Import workflow
  const handleImport = (data: any) => {
    try {
      const { nodes, edges } = importWorkflow(data);
      setStoreNodes(nodes);
      setStoreEdges(edges);
      saveToHistory();
      toast.success("Workflow imported");
    } catch (error) {
      toast.error("Failed to import workflow");
    }
  };

  // Clear canvas
  const handleClear = () => {
    if (confirm("Are you sure? This will clear all nodes and edges.")) {
      reset();
      toast.success("Canvas cleared");
    }
  };

  // Duplicate workflow
  const handleDuplicate = async () => {
    try {
      const newName = `${workflowName} (copy)`;
      await api.createWorkflow({
        name: newName,
        nodes: storeNodes,
        edges: storeEdges,
      });
      toast.success("Workflow duplicated");
    } catch (error) {
      toast.error("Failed to duplicate workflow");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading workflow...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-secondary bg-secondary/50 p-4">
        <div className="flex items-center justify-between gap-4">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-2xl font-bold bg-transparent border-none focus:outline-none"
          />
          <div className="flex gap-2">
            <ToolbarActions
              onExport={handleExport}
              onImport={handleImport}
              onClear={handleClear}
            />
            <Button
              onClick={handleDuplicate}
              variant="outline"
              size="icon"
              title="Duplicate Workflow"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="outline"
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button
              onClick={handleExecute}
              disabled={isExecuting || storeNodes.length === 0}
            >
              <Play className="mr-2 h-4 w-4" />
              Execute
            </Button>
          </div>
        </div>
      </header>

      {/* Validation Panel */}
      {storeNodes.length > 0 && (
        <div className="px-4 py-2">
          <ValidationPanel nodes={storeNodes} edges={storeEdges} />
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar onAddNode={handleAddNode} />

        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          <WorkflowCanvas
            initialNodes={storeNodes}
            initialEdges={storeEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDelete={handleDeleteNode}
            onNodeSelect={selectNode}
          />
        </div>

        {/* Right Sidebar - History */}
        <HistoryPanel workflowId={workflowId} />
      </div>
    </div>
  );
}