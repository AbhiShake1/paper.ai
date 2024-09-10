import Link from "next/link";

import { api, HydrateClient } from "@/trpc/server";
import { generateText } from "@/ai/generate-text";
import Image from "next/image";
import { ImageGeneratorPage } from "@/components/image-generator-page";

export default async function Home() {
  return (
    <HydrateClient>
      <main>
        <ImageGeneratorPage />
      </main>
    </HydrateClient>
  );
}
