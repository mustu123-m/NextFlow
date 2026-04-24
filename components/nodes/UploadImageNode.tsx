"use client";

import { Handle, Position, NodeProps } from "reactflow";
import { UploadImageNodeData } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X } from "lucide-react";
import NextImage from "next/image";

export default function UploadImageNode({
  data,
  selected,
}: NodeProps<UploadImageNodeData>) {
  const [preview, setPreview] = useState(data.preview || data.url);

  const handleUpload = () => {
    // TODO: Integrate Transloadit
    console.log("Upload image");
  };

  return (
    <div
      className={`rounded-lg border-2 bg-node-image/10 p-4 min-w-[240px] ${
        selected
          ? "border-node-image shadow-lg shadow-node-image/50"
          : "border-node-image/30"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <ImageIcon className="h-4 w-4 text-node-image" />
        <span className="text-xs font-semibold text-node-image">Upload Image</span>
        {data.status === "running" && (
          <div className="animate-pulse-glow w-2 h-2 rounded-full bg-node-image" />
        )}
        {data.status === "success" && (
          <div className="w-2 h-2 rounded-full bg-success" />
        )}
      </div>

      {preview ? (
        <div className="relative mb-2 bg-secondary rounded overflow-hidden">
          <NextImage
            src={preview}
            alt="Preview"
            width={200}
            height={150}
            className="w-full h-auto"
          />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-1 right-1 bg-background/80 p-1 rounded hover:bg-background"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Button
          onClick={handleUpload}
          variant="outline"
          className="w-full mb-2"
        >
          Choose Image
        </Button>
      )}

      {data.url && (
        <p className="text-xs text-muted-foreground truncate">{data.url}</p>
      )}

      {data.duration && (
        <p className="text-xs text-muted-foreground mt-2">{data.duration}ms</p>
      )}

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}