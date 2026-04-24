import { Node } from "reactflow";
import { LLMNodeData } from "@/lib/types";
import { generateContent } from "@/lib/utils/llm";

export async function executeLLMNode(
  node: Node<LLMNodeData>,
  inputs: Record<string, any>
): Promise<{ output: any }> {
  const model = node.data.model || "gemini-pro";
  const systemPrompt = node.data.systemPrompt || inputs.system_prompt;
  const userMessage = node.data.userMessage || inputs.user_message || "";
  const images = inputs.images || [];
  const temperature = node.data.temperature || 0.7;
  const maxTokens = node.data.maxTokens || 2048;

  const content = await generateContent(
    model,
    systemPrompt,
    userMessage,
    images,
    temperature,
    maxTokens
  );

  return {
    output: content,
  };
}