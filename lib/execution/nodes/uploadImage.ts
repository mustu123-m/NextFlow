import { Node } from "reactflow";
import { UploadImageNodeData } from "@/lib/types";

export async function executeUploadImageNode(
  node: Node<UploadImageNodeData>,
  inputs: Record<string, any>
): Promise<{ output: any }> {
  const url = node.data.url;
  if (!url) {
    throw new Error("No image URL provided");
  }

  return {
    output: {
      url,
      type: "image",
    },
  };
}