"use client";

import { Node, Edge } from "reactflow";
import { NodeData } from "@/lib/types";
import { validateDAG, validateConnections } from "@/lib/utils/validation";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ValidationPanelProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
}

export default function ValidationPanel({
  nodes,
  edges,
}: ValidationPanelProps) {
  const isDAGValid = validateDAG(nodes, edges);
  const connectionErrors = validateConnections(nodes, edges);
  const hasErrors = !isDAGValid || connectionErrors.length > 0;

  if (!hasErrors && nodes.length === 0) {
    return null;
  }

  return (
    <Card className="border-yellow-600 bg-yellow-500/10">
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {hasErrors ? (
              <AlertCircle className="h-4 w-4 text-error" />
            ) : (
              <CheckCircle className="h-4 w-4 text-success" />
            )}
            <span className="text-sm font-semibold">
              {hasErrors ? "Workflow has issues" : "Workflow is valid"}
            </span>
          </div>

          {!isDAGValid && (
            <p className="text-xs text-error">
              ⚠️ Circular dependency detected - cannot execute
            </p>
          )}

          {connectionErrors.map((error, i) => (
            <p key={i} className="text-xs text-error">
              ⚠️ {error}
            </p>
          ))}

          {nodes.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Add nodes to start building your workflow
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}