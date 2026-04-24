"use client";

import { Button } from "@/components/ui/button";
import {
  Type,
  Image as ImageIcon,
  Film,
  Zap,
  Crop,
  VideoIcon,
} from "lucide-react";
import { Node } from "reactflow";
import { NodeData } from "@/lib/types";

const nodeTemplates = [
  {
    type: "text",
    label: "Text",
    icon: Type,
    color: "text-node-text",
  },
  {
    type: "uploadImage",
    label: "Upload Image",
    icon: ImageIcon,
    color: "text-node-image",
  },
  {
    type: "uploadVideo",
    label: "Upload Video",
    icon: Film,
    color: "text-node-video",
  },
  {
    type: "llm",
    label: "LLM",
    icon: Zap,
    color: "text-node-llm",
  },
  {
    type: "cropImage",
    label: "Crop Image",
    icon: Crop,
    color: "text-node-crop",
  },
  {
    type: "extractFrame",
    label: "Extract Frame",
    icon: VideoIcon,
    color: "text-node-extract",
  },
];

interface SidebarProps {
  onAddNode: (type: string) => void;
}

export default function Sidebar({ onAddNode }: SidebarProps) {
  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/reactflow", nodeType);
  };

  return (
    <div className="w-64 border-r border-secondary bg-secondary/50 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold mb-4">Nodes</h3>
      <div className="space-y-2">
        {nodeTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <Button
              key={template.type}
              variant="outline"
              className="w-full justify-start cursor-move hover:bg-primary/10"
              onClick={() => onAddNode(template.type)}
              draggable
              onDragStart={(e) => handleDragStart(e, template.type)}
            >
              <Icon className={`mr-2 h-4 w-4 ${template.color}`} />
              {template.label}
            </Button>
          );
        })}
      </div>
      <div className="mt-6 p-3 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-400">
        💡 <strong>Tip:</strong> Drag nodes to canvas or click to add
      </div>
    </div>
  );
}