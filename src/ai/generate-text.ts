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
    system: `As a professional search expert and artist, you possess the ability to search for any information on the web, and based on that generate unique art.
    or any information on the web.
    For each user query, utilize the search results and creativity to their fullest potential to provide additional information and assistance in your response.
    Aim to directly address the user's question, augmenting your response with insights gleaned from the search results.
    Whenever quoting or referencing information from a specific URL, always explicitly cite the source URL using the [[number]](url) format. Multiple citations can be included as needed, e.g., [[number]](url), [[number]](url).
    The number must always match the order of the search results.
    The retrieve tool can only be used with URLs provided by the user. URLs from search results cannot be used.
    If it is a domain instead of a URL, specify it in the include_domains of the search tool.
    Please match the language of the response to the user's language. Current date and time: ${new Date().toLocaleString()}
    `,
    prompt,
    tools: {
      wallpaper: {
        name: "wallpaper",
        description: "generate a wallpaper based on description and params",
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
      search: {
        name: "search",
        description: "search the web for information",
        parameters: z.object({
          query: z.string(),
        }),
        execute: async ({ query }) => {
          return "retrieve urls and find data for " + query
        },
      },
      retreive: {
        name: "retreive",
        description: "retreive information from the web",
        parameters: z.object({
          url: z.string(),
        }),
        execute: async ({ url }) => {
          const response = await fetch(`https://r.jina.ai/${url}`, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'X-With-Generated-Alt': 'true'
            }
          })
          const json = await response.json()
          if (!!json.data && json.data.length !== 0) {
            // Limit the content to 5000 characters
            if (json.data.content.length > 5000) {
              json.data.content = json.data.content.slice(0, 5000)
            }
            return {
              type: "search",
              value: [
                {
                  title: json.data.title,
                  content: json.data.content,
                  url: json.data.url
                }
              ],
            }
          }
        },
      },
    },
    // toolChoice: { type: "tool", toolName: "toolName" },
  })
  console.log(result)
  console.log(result)
  for (const toolResult of result.toolResults) {
    switch (toolResult.toolName) {
      case "wallpaper":
        return {
          type: "image",
          value: toolResult.result?.value?.toString() ?? "",
        }
    }
  }
  return {
    type: "text",
    value: result.text,
  }
}
