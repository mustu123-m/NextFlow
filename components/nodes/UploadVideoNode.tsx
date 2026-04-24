"use client";

import { Handle, Position, NodeProps } from "reactflow";
import { UploadVideoNodeData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Film, X } from "lucide-react";
import { useState } from "react";

export default function UploadVideoNode({
  data,
  selected,
}: NodeProps<UploadVideoNodeData>) {
  const [url, setUrl] = useState(data.url || "");

  const handleUpload = () => {
    // TODO: Integrate Transloadit
    console.log("Upload video");
  };

  return (
    <div
      className={`rounded-lg border-2 bg-node-video/10 p-4 min-w-[240px] ${
        selected
          ? "border-node-video shadow-lg shadow-node-video/50"
          : "border-node-video/30"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Film className="h-4 w-4 text-node-video" />
        <span className="text-xs font-semibold text-node-video">Upload Video</span>
        {data.status === "running" && (
          <div className="animate-pulse-glow w-2 h-2 rounded-full bg-node-video" />
        )}
      </div>

      {url ? (
        <div className="bg-secondary rounded p-2 mb-2 flex items-center justify-between">
          <span className="text-xs truncate">{url}</span>
          <button onClick={() => setUrl(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Button
          onClick={handleUpload}
          variant="outline"
          className="w-full mb-2"
        >
          Choose Video
        </Button>
      )}

      {data.duration && (
        <p className="text-xs text-muted-foreground mt-2">{data.duration}ms</p>
      )}

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}