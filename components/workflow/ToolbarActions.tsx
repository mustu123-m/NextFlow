"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw, RotateCw, Download, Upload, Trash2 } from "lucide-react";
import { useWorkflowStore } from "@/lib/store/workflowStore";
import toast from "react-hot-toast";

interface ToolbarActionsProps {
  onExport: () => void;
  onImport: (data: any) => void;
  onClear: () => void;
}

export default function ToolbarActions({
  onExport,
  onImport,
  onClear,
}: ToolbarActionsProps) {
  const { undo, redo, canUndo, canRedo } = useWorkflowStore();

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const data = JSON.parse(event.target.result);
          onImport(data);
          toast.success("Workflow imported");
        } catch {
          toast.error("Invalid workflow file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          undo();
          toast.success("Undo");
        }}
        disabled={!canUndo()}
        title="Undo"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          redo();
          toast.success("Redo");
        }}
        disabled={!canRedo()}
        title="Redo"
      >
        <RotateCw className="h-4 w-4" />
      </Button>
      <div className="border-l border-secondary" />
      <Button
        variant="outline"
        size="icon"
        onClick={onExport}
        title="Export Workflow"
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleImport}
        title="Import Workflow"
      >
        <Upload className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onClear}
        title="Clear Canvas"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}