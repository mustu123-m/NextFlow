import { client } from "./client";
import { generateContent } from "@/lib/utils/llm";

// LLM Task
export const llmTask = client.defineJob({
  id: "llm-execution",
  name: "LLM Execution",
  version: "1.0.0",
  trigger: client.http({
    port: 3000,
  }),
  run: async (payload, io) => {
    const {
      model,
      systemPrompt,
      userMessage,
      images,
      temperature,
      maxTokens,
    } = payload;

    io.logger.info("Executing LLM task", { model, userMessage });

    const result = await generateContent(
      model,
      systemPrompt,
      userMessage,
      images,
      temperature,
      maxTokens
    );

    return result;
  },
});

// FFmpeg Crop Task
export const cropImageTask = client.defineJob({
  id: "crop-image",
  name: "Crop Image",
  version: "1.0.0",
  trigger: client.http({
    port: 3000,
  }),
  run: async (payload, io) => {
    const { imageUrl, x, y, width, height } = payload;

    io.logger.info("Cropping image", { imageUrl, x, y, width, height });

    // TODO: Implement FFmpeg crop operation
    // For now, return original URL
    return imageUrl;
  },
});

// FFmpeg Extract Frame Task
export const extractFrameTask = client.defineJob({
  id: "extract-frame",
  name: "Extract Frame from Video",
  version: "1.0.0",
  trigger: client.http({
    port: 3000,
  }),
  run: async (payload, io) => {
    const { videoUrl, timestamp, format } = payload;

    io.logger.info("Extracting frame", { videoUrl, timestamp, format });

    // TODO: Implement FFmpeg frame extraction
    // For now, return placeholder
    return `${videoUrl}?frame=${timestamp}`;
  },
});