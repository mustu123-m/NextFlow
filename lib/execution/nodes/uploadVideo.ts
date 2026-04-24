import { Node } from "reactflow";
import { UploadVideoNodeData } from "@/lib/types";

export async function executeUploadVideoNode(
  node: Node<UploadVideoNodeData>,
  inputs: Record<string, any>
): Promise<{ output: any }> {
  const url = node.data.url;
  if (!url) {
    throw new Error("No video URL provided");
  }

  return {
    output: {
      url,
      type: "video",
    },
  };
}