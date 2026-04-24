import { useState, useCallback } from "react";
import { WorkflowExecution, NodeExecution } from "@/lib/types";
import * as api from "@/lib/utils/api";

export function useExecution() {
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeWorkflow = useCallback(
    async (workflowId: string, mode: "full" | "selected" = "full") => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.executeWorkflow(workflowId, mode);
        setExecution(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Execution failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchExecutionHistory = useCallback(async (workflowId: string) => {
    setLoading(true);
    try {
      const history = await api.getExecutionHistory(workflowId);
      return history;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch history");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExecutionDetails = useCallback(async (executionId: string) => {
    setLoading(true);
    try {
      const details = await api.getExecutionDetails(executionId);
      setExecution(details);
      return details;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch details");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    execution,
    loading,
    error,
    executeWorkflow,
    fetchExecutionHistory,
    fetchExecutionDetails,
  };
}