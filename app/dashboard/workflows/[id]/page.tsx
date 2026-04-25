"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { Play, Save, Copy, Settings, Share2, Share, Menu, Sun, Moon } from "lucide-react";
import toast from "react-hot-toast";
import { Node, NodeChange, EdgeChange, Connection } from "reactflow";
import { NodeData } from "@/lib/types";
import * as api from "@/lib/utils/api";
import { applyNodeChanges } from "reactflow";
const [isExecuting, setIsExecuting] = useState(false);

// Add this state in the component
const [selectedForExecution, setSelectedForExecution] = useState<string[]>([]);

// Add these handler functions
const handleSelectForExecution = (nodeId: string) => {
  setSelectedForExecution((prev) =>
    prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
  );
};

const handleExecuteSelected = async () => {
  if (selectedForExecution.length === 0) {
    toast.error("Select nodes to execute");
    return;
  }

  setIsExecuting(true);
  try {
    await handleSave();
    // Execute only selected nodes
    await executeWorkflow(workflowId, "selected", selectedForExecution);
    toast.success("Selected nodes execution started");
  } catch (error) {
    toast.error("Failed to execute selected nodes");
  } finally {
    setIsExecuting(false);
  }
};


export default function WorkflowEditorPage() {
  const params = useParams();
  const workflowId = params.id as string;
  const nodeCounterRef = useRef(0);
  const [isDark, setIsDark] = useState(false);
  const [showNodeMenu, setShowNodeMenu] = useState(false);

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

  const [workflowName, setWorkflowName] = useState("Untitled");
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle dark mode toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Load workflow on mount
  useEffect(() => {
    const load = async () => {
      if (!workflowId) return;
      setLoading(true);
      try {
        const workflow = await api.getWorkflow(workflowId);
        setWorkflowName(workflow.name || "Untitled");
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

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setStoreNodes((prev) => applyNodeChanges(changes, prev));
  }, [setStoreNodes]);

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

  const onConnect = useCallback((connection: Connection) => {
    const newEdge = {
      ...connection,
      id: `edge-${Date.now()}`,
    };
    addStoreEdge(newEdge);
  }, [addStoreEdge]);

  const handleAddNode = (type: string) => {
    nodeCounterRef.current += 1;
    const uniqueId = `${type}-${Date.now()}-${nodeCounterRef.current}`;
    const newNode: Node<NodeData> = {
      id: uniqueId,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        id: uniqueId,
        type: type as any,
        label: type.charAt(0).toUpperCase() + type.slice(1),
      },
      draggable: true,
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
    <div className="flex h-screen bg-white dark:bg-slate-950">
      {/* Left Sidebar - Icon Only */}
      <Sidebar onAddNode={handleAddNode} />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header - Minimal */}
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-sm font-bold">⚙</span>
            </div>
            <div>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="text-lg font-semibold bg-transparent border-none focus:outline-none text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsDark(!isDark)}
              variant="ghost"
              size="icon"
              className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              className="gap-2 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>

            <Button
              variant="ghost"
              className="gap-2 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Turn workflow into app
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-slate-600 dark:text-slate-400"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Main Canvas Area with History Panel */}
        <div className="flex flex-1 overflow-hidden">
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

          {/* Right Sidebar - History Panel */}
          <HistoryPanel workflowId={workflowId} />
        </div>

        {/* Bottom Floating Toolbar */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-2 shadow-lg z-40">
          {/* Add Node Button - with dropdown */}
          <div className="relative">
            <Button
              onClick={() => setShowNodeMenu(!showNodeMenu)}
              size="icon"
              variant="ghost"
              className="rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Add node (N)"
            >
              <span className="text-xl">+</span>
            </Button>

            {/* Node Type Menu */}
            {showNodeMenu && (
              <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 z-50 w-48">
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { type: "text", label: "Text" },
                    { type: "uploadImage", label: "Image" },
                    { type: "uploadVideo", label: "Video" },
                    { type: "llm", label: "LLM" },
                    { type: "cropImage", label: "Crop" },
                    { type: "extractFrame", label: "Extract" },
                  ].map((node) => (
                    <Button
                      key={node.type}
                      onClick={() => {
                        handleAddNode(node.type);
                        setShowNodeMenu(false);
                      }}
                      variant="ghost"
                      className="text-xs text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 justify-start"
                    >
                      {node.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Select tool"
          >
            <span className="text-xl">✓</span>
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Hand tool (H)"
          >
            <span className="text-xl">✋</span>
          </Button>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />

          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="icon"
            variant="ghost"
            className="rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Save (Ctrl+S)"
          >
            <Save className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleExecute}
            disabled={isExecuting || storeNodes.length === 0}
            size="icon"
            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white"
            title="Execute (Ctrl+Enter)"
          >
            <Play className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Keyboard shortcuts"
          >
            <span className="text-xl">⌨</span>
          </Button>

          <Button
  onClick={() => setSelectedForExecution([])}
  disabled={selectedForExecution.length === 0}
  size="icon"
  variant="outline"
  className="rounded-full text-slate-600 dark:text-slate-300"
  title="Clear selection"
>
  <X className="h-4 w-4" />
</Button>

<Button
  onClick={handleExecuteSelected}
  disabled={isExecuting || selectedForExecution.length === 0}
  size="icon"
  className="rounded-full bg-green-500 hover:bg-green-600 text-white"
  title="Execute selected nodes"
>
  <Play className="h-4 w-4" />
</Button>
        </div>

        {/* Close menu when clicking elsewhere */}
        {showNodeMenu && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowNodeMenu(false)}
          />
        )}
      </div>
    </div>
  );
}