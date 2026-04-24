import { TriggerClient } from "@trigger.dev/sdk";

export const client = new TriggerClient({
  id: "nextprod",
  apiKey: process.env.TRIGGER_DEV_API_KEY,
  apiUrl: process.env.TRIGGER_DEV_API_URL || "https://api.trigger.dev",
});