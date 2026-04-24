"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import WorkflowCanvas from "@/components/workflow/WorkflowCanvas";
import Sidebar from "@/components/workflow/Sidebar";
import HistoryPanel from "@/components/workflow/HistoryPanel";
import ToolbarActions from "@/components/workflow/ToolbarActions";
import ValidationPanel from "@/components/workflow/ValidationPanel";
import { useWorkflow } from "@/lib/hooks/useWorkflow";
import { useExecution } from "@/lib/hooks/useExecution";
import { useWorkflowStore } from "@/lib/store/workflowStore";
import { exportWorkflow, importWorkflow } from "@/components/workflow/WorkflowExportImport";
import { Play, Save, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { Node } from "reactflow";
import { NodeData } from "@/lib/types";

export default function WorkflowEditorPage() {
  const params = useParams();
  const workflowId = params.id as string;

  const {
    nodes: hookNodes,
    edges: hookEdges,
    loading,
    setNodes: setHookNodes,
    setEdges: setHookEdges,
    loadWorkflow,
    saveWorkflow,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useWorkflow(workflowId);

  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    updateNode,
    deleteNode: deleteStoreNode,
    addNode: addStoreNode,
    addEdge: addStoreEdge,
    removeEdge: removeStoreEdge,
    undo,
    redo,
    canUndo,
    canRedo,
    selectNode,
    saveToHistory,
    reset,
  } = useWorkflowStore();

  const { executeWorkflow, execution } = useExecution();

  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Sync with store
  useEffect(() => {
    if (hookNodes.length > 0) {
      setStoreNodes(hookNodes);
      setStoreEdges(hookEdges);
    }
  }, [hookNodes, hookEdges]);

  // Load workflow on mount
  useEffect(() => {
    loadWorkflow();
  }, [loadWorkflow]);

 const handleAddNode = (type: string) => {
  const newNode: Node<NodeData> = {
    id: `${type}-${Date.now()}`,
    data: {
      id: `${type}-${Date.now()}`,
      type: type as any,
      label: type.charAt(0).toUpperCase() + type.slice(1),
    },
    position: { x: Math.random() * 400, y: Math.random() * 400 },
     type: type,
    draggable: true,  // ← ADD THIS LINE!
  };

  addStoreNode(newNode);
  saveToHistory();
  toast.success(`${type} node added`);
};

  const handleDeleteNode = (id: string) => {
    deleteStoreNode(id);
    saveToHistory();
    toast.success("Node deleted");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveWorkflow(workflowName);
      setHookNodes(storeNodes);
      setHookEdges(storeEdges);
      saveToHistory();
      toast.success("Workflow saved");
    } catch (error) {
      toast.error("Failed to save workflow");
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleExport = () => {
    exportWorkflow(storeNodes, storeEdges, workflowName);
    toast.success("Workflow exported");
  };

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

  const handleClear = () => {
    if (confirm("Are you sure? This will clear all nodes and edges.")) {
      reset();
      toast.success("Canvas cleared");
    }
  };

  const handleDuplicate = async () => {
    try {
      const newName = `${workflowName} (copy)`;
      await saveWorkflow(newName);
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
        <div className="flex-1 overflow-hidden"><WorkflowCanvas
  initialNodes={storeNodes}
  initialEdges={storeEdges}
  onNodesChange={(changes:any) => {
    onNodesChange(changes);
    setStoreNodes(hookNodes);
  }}
  onEdgesChange={(changes:any) => {
    onEdgesChange(changes);
    setStoreEdges(hookEdges);
  }}
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