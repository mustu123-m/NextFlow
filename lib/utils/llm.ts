import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY!
);

export async function generateContent(
  model: string,
  systemPrompt: string | undefined,
  userMessage: string,
  images?: string[],
  temperature = 0.7,
  maxTokens = 2048
) {
  try {
    const modelInstance = genAI.getGenerativeModel({ model });
    
    const content: any[] = [];
    
    if (systemPrompt) {
      content.push({
        role: "user",
        parts: [{ text: systemPrompt }],
      });
      content.push({
        role: "model",
        parts: [{ text: "Understood." }],
      });
    }
    
    // Add user message with images
    const messageParts: any[] = [];
    if (images && images.length > 0) {
      for (const imageUrl of images) {
        const imageData = await fetchImageAsBase64(imageUrl);
        messageParts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: imageData,
          },
        });
      }
    }
    messageParts.push({ text: userMessage });
    
    const response = await modelInstance.generateContent({
      contents: [
        ...content,
        {
          role: "user",
          parts: messageParts,
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });
    
    return response.response.text();
  } catch (error) {
    throw new Error(`LLM generation failed: ${error}`);
  }
}

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

export const GEMINI_MODELS = [
  "gemini-pro",
  "gemini-pro-vision",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
];