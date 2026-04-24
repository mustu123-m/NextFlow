"use client";

import { Handle, Position, NodeProps } from "reactflow";
import { LLMNodeData } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { GEMINI_MODELS } from "@/lib/utils/llm";

export default function LLMNode({ data, selected }: NodeProps<LLMNodeData>) {
  const [model, setModel] = useState(data.model || "gemini-pro");
  const [systemPrompt, setSystemPrompt] = useState(data.systemPrompt || "");
  const [userMessage, setUserMessage] = useState(data.userMessage || "");

  return (
    <div
      className={`rounded-lg border-2 bg-node-llm/10 p-4 min-w-[280px] ${
        selected
          ? "border-node-llm shadow-lg shadow-node-llm/50"
          : "border-node-llm/30"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-node-llm" />
        <span className="text-xs font-semibold text-node-llm">LLM Node</span>
        {data.status === "running" && (
          <div className="animate-pulse-glow w-2 h-2 rounded-full bg-node-llm" />
        )}
        {data.status === "success" && (
          <div className="w-2 h-2 rounded-full bg-success" />
        )}
      </div>

      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="w-full mb-2 text-xs bg-background border border-secondary rounded p-1 text-foreground"
      >
        {GEMINI_MODELS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <textarea
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
        placeholder="System prompt (optional)..."
        className="w-full text-xs bg-background text-foreground p-1 rounded border border-secondary resize-none focus:outline-none focus:ring-2 focus:ring-node-llm mb-2"
        rows={2}
      />

      <textarea
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        placeholder="User message..."
        className="w-full text-xs bg-background text-foreground p-1 rounded border border-secondary resize-none focus:outline-none focus:ring-2 focus:ring-node-llm"
        rows={2}
      />

      {data.output && (
        <div className="mt-2 p-2 bg-background rounded text-xs text-muted-foreground max-h-20 overflow-y-auto">
          {data.output}
        </div>
      )}

      {data.duration && (
        <p className="text-xs text-muted-foreground mt-2">{data.duration}ms</p>
      )}

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}