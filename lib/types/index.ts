import { Node, Edge } from "reactflow";

// Node Types
export type NodeType = 
  | "text" 
  | "uploadImage" 
  | "uploadVideo" 
  | "llm" 
  | "cropImage" 
  | "extractFrame";

export type NodeStatus = "pending" | "running" | "success" | "failed" | "skipped";

// Base Node Data
export interface BaseNodeData {
  id: string;
  type: NodeType;
  label: string;
  status?: NodeStatus;
  duration?: number;
  output?: any;
  error?: string;
}

// Text Node
export interface TextNodeData extends BaseNodeData {
  type: "text";
  content: string;
}

// Upload Image Node
export interface UploadImageNodeData extends BaseNodeData {
  type: "uploadImage";
  url?: string;
  preview?: string;
}

// Upload Video Node
export interface UploadVideoNodeData extends BaseNodeData {
  type: "uploadVideo";
  url?: string;
  preview?: string;
}

// LLM Node
export interface LLMNodeData extends BaseNodeData {
  type: "llm";
  model: string;
  systemPrompt?: string;
  userMessage?: string;
  temperature?: number;
  maxTokens?: number;
}

// Crop Image Node
export interface CropImageNodeData extends BaseNodeData {
  type: "cropImage";
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

// Extract Frame Node
export interface ExtractFrameNodeData extends BaseNodeData {
  type: "extractFrame";
  timestamp?: number; // seconds or percentage
  format?: "jpg" | "png";
}

export type NodeData = 
  | TextNodeData 
  | UploadImageNodeData 
  | UploadVideoNodeData 
  | LLMNodeData 
  | CropImageNodeData 
  | ExtractFrameNodeData;

// Workflow
export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
  createdAt: Date;
  updatedAt: Date;
}

// Execution
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId: string;
  status: "RUNNING" | "SUCCESS" | "FAILED" | "PARTIAL";
  startedAt: Date;
  completedAt?: Date;
  nodeExecutions: NodeExecution[];
}

export interface NodeExecution {
  id: string;
  executionId: string;
  nodeId: string;
  nodeType: NodeType;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "SKIPPED";
  input?: any;
  output?: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
}

// API Request/Response
export interface ExecuteNodeRequest {
  nodeId: string;
  nodeData: NodeData;
  inputs: Record<string, any>;
}

export interface ExecuteNodeResponse {
  success: boolean;
  output?: any;
  error?: string;
  duration: number;
}