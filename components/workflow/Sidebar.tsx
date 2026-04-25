"use client";

import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  Film,
  Zap,
  Type,
  Crop,
  Scissors,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  onAddNode: (type: string) => void;
}

const nodeTemplates = [
  {
    type: "text",
    icon: Type,
    color: "text-blue-500",
    label: "Text",
  },
  {
    type: "uploadImage",
    icon: ImageIcon,
    color: "text-purple-500",
    label: "Image",
  },
  {
    type: "uploadVideo",
    icon: Film,
    color: "text-orange-500",
    label: "Video",
  },
  {
    type: "llm",
    icon: Zap,
    color: "text-yellow-500",
    label: "LLM",
  },
  {
    type: "cropImage",
    icon: Crop,
    color: "text-green-500",
    label: "Crop",
  },
  {
    type: "extractFrame",
    icon: Scissors,
    color: "text-red-500",
    label: "Extract",
  },
];

export default function Sidebar({ onAddNode }: SidebarProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/reactflow", nodeType);
  };

  return (
    <div className="w-20 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col items-center py-4 gap-3">
      {nodeTemplates.map((template) => {
        const Icon = template.icon;
        return (
          <div key={template.type} className="relative group">
            <Button
              onClick={() => onAddNode(template.type)}
              size="icon"
              variant="ghost"
              className={`${template.color} hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg`}
              draggable
              onDragStart={(e) => handleDragStart(e, template.type)}
              title={template.label}
            >
              <Icon className="h-5 w-5" />
            </Button>
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              {template.label}
            </div>
          </div>
        );
      })}

      <div className="flex-1" />

      {/* More Options */}
      <Button
        size="icon"
        variant="ghost"
        className="text-slate-400 hover:text-slate-600 rounded-lg"
        title="More"
      >
        <MoreHorizontal className="h-5 w-5" />
      </Button>
    </div>
  );
}