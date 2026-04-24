import { Node } from "reactflow";
import { TextNodeData } from "@/lib/types";

export async function executeTextNode(
  node: Node<TextNodeData>,
  inputs: Record<string, any>
): Promise<{ output: any }> {
  const content = node.data.content || "";
  return {
    output: content,
  };
}