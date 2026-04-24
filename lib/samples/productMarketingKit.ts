import { Node, Edge } from "reactflow";
import { NodeData } from "@/lib/types";

export const sampleWorkflow = {
  name: "Product Marketing Kit Generator",
  description:
    "Generate marketing materials from product image and video with AI-powered analysis",
  nodes: [
    {
      id: "upload-image",
      type: "uploadImage",
      data: {
        id: "upload-image",
        type: "uploadImage",
        label: "Product Image",
        content: "",
      },
      position: { x: 50, y: 100 },
    },
    {
      id: "upload-video",
      type: "uploadVideo",
      data: {
        id: "upload-video",
        type: "uploadVideo",
        label: "Product Video",
        content: "",
      },
      position: { x: 50, y: 300 },
    },
    {
      id: "crop-image",
      type: "cropImage",
      data: {
        id: "crop-image",
        type: "cropImage",
        label: "Crop Image",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
      position: { x: 300, y: 100 },
    },
    {
      id: "extract-frame",
      type: "extractFrame",
      data: {
        id: "extract-frame",
        type: "extractFrame",
        label: "Extract Frame",
        timestamp: 50,
        format: "jpg",
      },
      position: { x: 300, y: 300 },
    },
    {
      id: "llm-description",
      type: "llm",
      data: {
        id: "llm-description",
        type: "llm",
        label: "Product Description",
        model: "gemini-pro-vision",
        systemPrompt:
          "You are a product marketing expert. Write compelling product descriptions.",
        userMessage:
          "Analyze this product image and write a compelling marketing description.",
      },
      position: { x: 550, y: 100 },
    },
    {
      id: "llm-summary",
      type: "llm",
      data: {
        id: "llm-summary",
        type: "llm",
        label: "Marketing Summary",
        model: "gemini-pro",
        systemPrompt:
          "You are a social media manager. Create engaging post content.",
        userMessage:
          "Create a compelling social media post based on this product description and video frame.",
      },
      position: { x: 550, y: 300 },
    },
    {
      id: "final-summary",
      type: "text",
      data: {
        id: "final-summary",
        type: "text",
        label: "Final Marketing Kit",
        content: "",
      },
      position: { x: 800, y: 200 },
    },
  ] as Node<NodeData>[],
  edges: [
    {
      id: "edge-upload-image-crop",
      source: "upload-image",
      target: "crop-image",
    },
    {
      id: "edge-upload-video-extract",
      source: "upload-video",
      target: "extract-frame",
    },
    {
      id: "edge-crop-llm-description",
      source: "crop-image",
      target: "llm-description",
    },
    {
      id: "edge-extract-llm-summary",
      source: "extract-frame",
      target: "llm-summary",
    },
    {
      id: "edge-llm-description-final",
      source: "llm-description",
      target: "final-summary",
    },
    {
      id: "edge-llm-summary-final",
      source: "llm-summary",
      target: "final-summary",
    },
  ] as Edge[],
};