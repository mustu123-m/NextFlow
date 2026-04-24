"use client";

import { Handle, Position, NodeProps } from "reactflow";
import { TextNodeData } from "@/lib/types";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Type } from "lucide-react";

export default function TextNode({ data, selected, isConnecting }: NodeProps<TextNodeData>) {
  const [content, setContent] = useState(data.content || "");

  return (
    <div
      className={`rounded-lg border-2 bg-node-text/10 p-4 min-w-[200px] ${
        selected
          ? "border-node-text shadow-lg shadow-node-text/50"
          : "border-node-text/30"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Type className="h-4 w-4 text-node-text" />
        <span className="text-xs font-semibold text-node-text">Text</span>
        {data.status === "running" && (
          <div className="animate-pulse-glow w-2 h-2 rounded-full bg-node-text" />
        )}
        {data.status === "success" && (
          <div className="w-2 h-2 rounded-full bg-success" />
        )}
        {data.status === "failed" && (
          <div className="w-2 h-2 rounded-full bg-error" />
        )}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter text content..."
        className="w-full bg-background text-foreground text-sm p-2 rounded border border-secondary resize-none focus:outline-none focus:ring-2 focus:ring-node-text"
        rows={3}
      />

      {data.duration && (
        <p className="text-xs text-muted-foreground mt-2">{data.duration}ms</p>
      )}

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}