import { Node } from "reactflow";
import { ExtractFrameNodeData } from "@/lib/types";

export async function executeExtractFrameNode(
  node: Node<ExtractFrameNodeData>,
  inputs: Record<string, any>
): Promise<{ output: any }> {
  const videoUrl = inputs.default || inputs.video_url;
  if (!videoUrl) {
    throw new Error("No video URL provided");
  }

  const timestamp = node.data.timestamp || 0;
  const format = node.data.format || "jpg";

  // TODO: Implement actual frame extraction via FFmpeg on Trigger.dev
  // For now, return a placeholder
  return {
    output: {
      url: `${videoUrl}?frame=${timestamp}`,
      format,
    },
  };
}