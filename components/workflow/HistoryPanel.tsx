"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Clock } from "lucide-react";
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
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    loadHistory();
    const interval = setInterval(loadHistory, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [workflowId]);

  async function loadHistory() {
    try {
      const history = await api.getExecutionHistory(workflowId);
      setExecutions(history);
      setAuthError(false);
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        setAuthError(true);
        setExecutions([]);
      } else {
        console.error("Failed to load history:", error);
      }
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "FAILED":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      case "RUNNING":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "PARTIAL":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200";
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "✓";
      case "FAILED":
        return "✕";
      case "RUNNING":
        return "⟳";
      default:
        return "•";
    }
  };

  return (
    <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Workflow History</h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {authError ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            History unavailable. Please ensure you're logged in.
          </p>
        ) : loading && executions.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading...</p>
        ) : executions.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">No executions yet</p>
        ) : (
          <div className="space-y-3">
            {executions.map((execution) => (
              <div
                key={execution.id}
                className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden"
              >
                {/* Run Entry */}
                <div
                  className="p-3 bg-slate-50 dark:bg-slate-900 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() =>
                    setExpandedId(expandedId === execution.id ? null : execution.id)
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {expandedId === execution.id ? (
                        <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                      )}

                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColor(
                          execution.status
                        )}`}
                      >
                        {statusIcon(execution.status)} {execution.status}
                      </span>

                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {new Date(execution.startedAt).toLocaleTimeString()}
                      </span>
                    </div>

                    {execution.duration && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                        {execution.duration}ms
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === execution.id && (
                  <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-950 space-y-2 max-h-96 overflow-y-auto">
                    {/* Execution Scope Info */}
                    <div className="text-xs">
                      <p className="font-semibold text-slate-900 dark:text-white mb-1">
                        Execution ID:
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 break-all font-mono">
                        {execution.id}
                      </p>
                    </div>

                    <div className="text-xs">
                      <p className="font-semibold text-slate-900 dark:text-white mb-1">
                        Scope:
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        {execution.scope || "Full Workflow"}
                      </p>
                    </div>

                    {/* Node-Level History */}
                    {execution.nodeExecutions && execution.nodeExecutions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <p className="font-semibold text-slate-900 dark:text-white text-xs mb-2">
                          Node-Level History:
                        </p>
                        <div className="space-y-1">
                          {execution.nodeExecutions.map((nodeExec, idx) => (
                            <div
                              key={nodeExec.id}
                              className="flex items-start gap-2 text-xs p-2 bg-slate-50 dark:bg-slate-900 rounded"
                            >
                              <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">
                                {idx + 1}.
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="font-semibold text-slate-900 dark:text-white truncate">
                                    {nodeExec.nodeType}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-xs ${statusColor(
                                      nodeExec.status
                                    )}`}
                                  >
                                    {statusIcon(nodeExec.status)} {nodeExec.status}
                                  </span>
                                </div>

                                {nodeExec.inputs && (
                                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                                    Input: {JSON.stringify(nodeExec.inputs).substring(0, 50)}...
                                  </p>
                                )}

                                {nodeExec.output && (
                                  <p className="text-slate-600 dark:text-slate-300 text-xs mt-1 break-words">
                                    Output: {String(nodeExec.output).substring(0, 100)}...
                                  </p>
                                )}

                                {nodeExec.duration && (
                                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                                    Duration: {nodeExec.duration}ms
                                  </p>
                                )}

                                {nodeExec.error && (
                                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                                    Error: {nodeExec.error}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}