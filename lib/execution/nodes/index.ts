import { Node } from "reactflow";
import { NodeData, NodeType } from "@/lib/types";
import { executeTextNode } from "./text";
import { executeUploadImageNode } from "./uploadImage";
import { executeUploadVideoNode } from "./uploadVideo";
import { executeLLMNode } from "./llm";
import { executeCropImageNode } from "./cropImage";
import { executeExtractFrameNode } from "./extractFrame";

export async function executeNode(
  node: Node<NodeData>,
  inputs: Record<string, any>
): Promise<{ output: any; error?: string }> {
  const type = node.data.type as NodeType;

  switch (type) {
    case "text":
      return executeTextNode(node as any, inputs);
    case "uploadImage":
      return executeUploadImageNode(node as any, inputs);
    case "uploadVideo":
      return executeUploadVideoNode(node as any, inputs);
    case "llm":
      return executeLLMNode(node as any, inputs);
    case "cropImage":
      return executeCropImageNode(node as any, inputs);
    case "extractFrame":
      return executeExtractFrameNode(node as any, inputs);
    default:
      throw new Error(`Unknown node type: ${type}`);
  }
}