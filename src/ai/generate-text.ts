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
          params: z.array(z.string()),
        }),
        execute: async ({ description, params }) => {
          const result = await fal.subscribe("fal-ai/lora", {
            input: {
              model_name: "stabilityai/stable-diffusion-xl-base-1.0",
              prompt: "Photo of a european medieval 40 year old queen, silver hair, highly detailed face, detailed eyes, head shot, intricate crown, age spots, wrinkles"
            },
            logs: true,
            onQueueUpdate: (update) => {
              // if (update.status === "IN_PROGRESS") {
              //   update.logs.map((log) => log.message).forEach(console.log);
              // }
            },
          });
          console.log(result)
          if (!result) return result
          if (typeof result === "object" && "images" in result && result.images instanceof Array && result.images.length > 0 && "url" in result.images[0]) {
            return result.images[0].url
          }
          return undefined
        },
      },
    },
    // toolChoice: { type: "tool", toolName: "toolName" },
  })
  console.log(result)
  return result
}
