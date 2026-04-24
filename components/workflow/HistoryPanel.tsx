"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import * as api from "@/lib/utils/api";
import { WorkflowExecution } from "@/lib/types";
import toast from "react-hot-toast";

interface HistoryPanelProps {
  workflowId: string;
}

export default function HistoryPanel({ workflowId }: HistoryPanelProps) {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
    const interval = setInterval(loadHistory, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [workflowId]);

  async function loadHistory() {
    try {
      const history = await api.getExecutionHistory(workflowId);
      setExecutions(history);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-success";
      case "FAILED":
        return "text-error";
      case "RUNNING":
        return "text-warning";
      case "PARTIAL":
        return "text-warning";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="w-80 border-l border-secondary bg-secondary/50 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold mb-4">Workflow History</h3>

      {executions.length === 0 ? (
        <p className="text-xs text-muted-foreground">No executions yet</p>
      ) : (
        <div className="space-y-2">
          {executions.map((execution) => (
            <Card key={execution.id} className="cursor-pointer hover:border-primary">
              <CardHeader
                className="py-2 px-3"
                onClick={() =>
                  setExpandedId(
                    expandedId === execution.id ? null : execution.id
                  )
                }
              >
                <div className="flex items-center gap-2">
                  {expandedId === execution.id ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className={`text-xs font-semibold ${statusColor(execution.status)}`}>
                    {execution.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(execution.startedAt).toLocaleTimeString()}
                  </span>
                </div>
              </CardHeader>

              {expandedId === execution.id && (
                <CardContent className="py-2 px-3 border-t border-secondary">
                  <div className="space-y-1 text-xs">
                    {execution.nodeExecutions?.map((nodeExec) => (
                      <div
                        key={nodeExec.id}
                        className="flex items-center justify-between text-muted-foreground"
                      >
                        <span>{nodeExec.nodeType}</span>
                        <div className="flex items-center gap-2">
                          <span className={statusColor(nodeExec.status)}>
                            {nodeExec.status}
                          </span>
                          {nodeExec.duration && (
                            <span>{nodeExec.duration}ms</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}