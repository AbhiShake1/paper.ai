"use server"

import { google } from "@ai-sdk/google"
import { generateText as genText } from "ai"
import { z } from "zod"
import * as fal from "@fal-ai/serverless-client";
import { env } from "@/env";

fal.config({
  credentials: env.FAL_API_KEY,
});

export async function generateText(prompt: string) {
  "use server"

  const result = await genText({
    model: google("gemini-1.5-flash"),
    prompt,
    tools: {
      wallpaper: {
        name: "wallpaper",
        description: "generate a wallpaper",
        parameters: z.object({
          description: z.string(),
          params: z.array(z.object({ name: z.string(), value: z.string() })),
        }),
        execute: async ({ description, params }) => {
          const result = await fal.subscribe("fal-ai/lora", {
            input: {
              model_name: "stabilityai/stable-diffusion-xl-base-1.0",
              prompt: `generate a wallpaper based on following params: ${params.map((p) => `${p.name}- ${p.value}`).join(", ")}. ${description}`,
            },
            onQueueUpdate: (update) => {
              // if (update.status === "IN_PROGRESS") {
              //   update.logs.map((log) => log.message).forEach(console.log);
              // }
            },
          });
          if (!result) return undefined
          if (typeof result === "object" && "images" in result && result.images instanceof Array && result.images.length > 0 && "url" in result.images[0]) {
            return {
              type: "image",
              value: result.images[0].url,
            }
          }
          return undefined
        },
      },
    },
    // toolChoice: { type: "tool", toolName: "toolName" },
  })
  if (result.toolResults[0]?.toolName === "wallpaper") {
    return {
      type: "image",
      value: result.toolResults[0]?.result?.value?.toString() ?? "",
    }
  }
  return {
    type: "text",
    value: result.text,
  }
}
