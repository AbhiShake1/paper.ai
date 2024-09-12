"use server"

// import { createOpenAI as createAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI as createAI } from "@ai-sdk/google"
import { generateText as genText } from "ai"
import { z } from "zod"
import * as fal from "@fal-ai/serverless-client";
import { env } from "@/env";

fal.config({
  credentials: env.FAL_API_KEY,
});

const model = createAI({
  // baseURL: "https://models.inference.ai.azure.com",
  // apiKey: env.GITHUB_TOKEN,
})

export async function generateText(prompt: string) {
  const result = await genText({
    model: model("gemini-1.5-flash"),
    maxToolRoundtrips: 2,
    system: `As a professional search expert and artist, you possess the ability to search for any information on the web, and based on that generate unique art.
    or any information on the web.
    For each user query, utilize the search results and creativity to their fullest potential to provide additional information and assistance in your response.
    Aim to directly address the user's question, augmenting your response with insights gleaned from the search results.
    The retrieve tool can only be used with URLs provided by the user. URLs from search results cannot be used.
    If it is a domain instead of a URL, specify it in the include_domains of the search tool.
    Please match the language of the response to the user's language. 
    Current date and time: ${new Date().toLocaleString()}.
    Generate image of choice and give the url without asking for any further question.
    `,
    prompt,
    tools: {
      wallpaper: {
        name: "wallpaper",
        description: "generate a wallpaper based on description and params",
        parameters: z.object({
          description: z.string(),
          params: z.array(z.object({ factor: z.string(), scrapedValue: z.string().describe("the value received from retreive tool") })),
        }),
        execute: async ({ description, params }) => {
          const result = await fal.subscribe("fal-ai/lora", {
            input: {
              model_name: "stabilityai/stable-diffusion-xl-base-1.0",
              prompt: `generate a wallpaper based on following params: ${(params as Array<{ factor: string, scrapedValue: string }>).map((p) => `${p.factor}- ${p.scrapedValue}`).join(", ")}. ${description}`,
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
        execute: ({ query }) => tavilySearch(query),
      },
    },
    // toolChoice: { type: "tool", toolName: "toolName" },
  })

  for (const toolResult of result.toolResults) {
    switch (toolResult.toolName) {
      case "wallpaper":
        return {
          type: "image",
          value: toolResult.result?.value?.toString() ?? "",
        }
      // case "search":
      //   return generateText(`generate a wallpaper based on following prompt and following raw data
      //   prompt: ${prompt}
      //   raw data:
      //   ${toolResult.result?.toString()}
      //   `)
    }
  }

  return {
    type: "text",
    value: result.text,
  }
}

async function tavilySearch(
  query: string,
  searchDepth: 'basic' | 'advanced' = 'basic',
) {
  const apiKey = env.TAVILY_API_KEY
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: 1,
      search_depth: searchDepth,
      include_images: false,
      include_image_descriptions: false,
      include_answers: true,
      include_domains: [],
      exclude_domains: []
    })
  })

  const data = await response.json()

  return {
    result: data.results[0]?.content,
  }
}
