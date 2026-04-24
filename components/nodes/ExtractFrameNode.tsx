"use client";

import { Handle, Position, NodeProps } from "reactflow";
import { ExtractFrameNodeData } from "@/lib/types";
import { useState } from "react";
import { VideoIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ExtractFrameNode({
  data,
  selected,
}: NodeProps<ExtractFrameNodeData>) {
  const [timestamp, setTimestamp] = useState(data.timestamp || 0);
  const [format, setFormat] = useState(data.format || "jpg");

  return (
    <div
      className={`rounded-lg border-2 bg-node-extract/10 p-4 min-w-[240px] ${
        selected
          ? "border-node-extract shadow-lg shadow-node-extract/50"
          : "border-node-extract/30"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <VideoIcon className="h-4 w-4 text-node-extract" />
        <span className="text-xs font-semibold text-node-extract">Extract Frame</span>
        {data.status === "running" && (
          <div className="animate-pulse-glow w-2 h-2 rounded-full bg-node-extract" />
        )}
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <label className="block text-muted-foreground mb-1">
            Timestamp (seconds or %)
          </label>
          <Input
            type="number"
            value={timestamp}
            onChange={(e) => setTimestamp(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-muted-foreground mb-1">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as "jpg" | "png")}
            className="w-full bg-background border border-secondary rounded p-1 text-foreground"
          >
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
          </select>
        </div>
      </div>

      {data.duration && (
        <p className="text-xs text-muted-foreground mt-2">{data.duration}ms</p>
      )}

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}