import { Node } from "reactflow";
import { CropImageNodeData } from "@/lib/types";

export async function executeCropImageNode(
  node: Node<CropImageNodeData>,
  inputs: Record<string, any>
): Promise<{ output: any }> {
  const imageUrl = inputs.default || inputs.image_url;
  if (!imageUrl) {
    throw new Error("No image URL provided");
  }

  const x = node.data.x || 0;
  const y = node.data.y || 0;
  const width = node.data.width || 100;
  const height = node.data.height || 100;

  // TODO: Implement actual image cropping via FFmpeg
  // For now, return the original URL
  return {
    output: {
      url: imageUrl,
      crop: { x, y, width, height },
    },
  };
}