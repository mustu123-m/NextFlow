"use client";

import { Handle, Position, NodeProps } from "reactflow";
import { CropImageNodeData } from "@/lib/types";
import { useState } from "react";
import { Crop } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CropImageNode({
  data,
  selected,
}: NodeProps<CropImageNodeData>) {
  const [x, setX] = useState(data.x || 0);
  const [y, setY] = useState(data.y || 0);
  const [width, setWidth] = useState(data.width || 100);
  const [height, setHeight] = useState(data.height || 100);

  return (
    <div
      className={`rounded-lg border-2 bg-node-crop/10 p-4 min-w-[240px] ${
        selected
          ? "border-node-crop shadow-lg shadow-node-crop/50"
          : "border-node-crop/30"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Crop className="h-4 w-4 text-node-crop" />
        <span className="text-xs font-semibold text-node-crop">Crop Image</span>
        {data.status === "running" && (
          <div className="animate-pulse-glow w-2 h-2 rounded-full bg-node-crop" />
        )}
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <label className="block text-muted-foreground mb-1">X (%)</label>
          <Input
            type="number"
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
            min="0"
            max="100"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-muted-foreground mb-1">Y (%)</label>
          <Input
            type="number"
            value={y}
            onChange={(e) => setY(Number(e.target.value))}
            min="0"
            max="100"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-muted-foreground mb-1">Width (%)</label>
          <Input
            type="number"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            min="0"
            max="100"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-muted-foreground mb-1">Height (%)</label>
          <Input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            min="0"
            max="100"
            className="w-full"
          />
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