import { useState, useCallback } from "react";
import { Node, Edge } from "reactflow";
import { NodeData } from "@/lib/types";
import * as api from "@/lib/utils/api";

export function useWorkflow(workflowId?: string) {
  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorkflow = useCallback(async () => {
    if (!workflowId) return;
    setLoading(true);
    try {
      const workflow = await api.getWorkflow(workflowId);
      setNodes(workflow.nodes);
      setEdges(workflow.edges);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflow");
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  const saveWorkflow = useCallback(
    async (name: string, description?: string) => {
      setLoading(true);
      try {
        if (workflowId) {
          await api.updateWorkflow(workflowId, {
            name,
            description,
            nodes,
            edges,
          });
        } else {
          await api.createWorkflow({
            name,
            description,
            nodes,
            edges,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save workflow");
      } finally {
        setLoading(false);
      }
    },
    [workflowId, nodes, edges]
  );

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => {
      const updated = [...nds];
      changes.forEach((change: any) => {
        const index = updated.findIndex((n) => n.id === change.id);
        if (index !== -1) {
          if (change.type === "position") {
            updated[index].position = change.position;
          } else if (change.type === "select") {
            updated[index].selected = change.isSelected;
          } else if (change.type === "remove") {
            updated.splice(index, 1);
          }
        }
      });
      return updated;
    });
  }, []);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => {
      let updated = [...eds];
      changes.forEach((change: any) => {
        if (change.type === "remove") {
          updated = updated.filter((e) => e.id !== change.id);
        }
      });
      return updated;
    });
  }, []);

  const onConnect = useCallback((connection: any) => {
    setEdges((eds) => [...eds, { ...connection, id: `edge-${Date.now()}` }]);
  }, []);

  return {
    nodes,
    edges,
    loading,
    error,
    setNodes,
    setEdges,
    loadWorkflow,
    saveWorkflow,
    onNodesChange,
    onEdgesChange,
    onConnect,
  };
}