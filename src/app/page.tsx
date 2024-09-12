import { ImageGeneratorPage } from "@/components/image-generator-page";

export const maxDuration = 5 * 60

export default async function Home() {
  return (
    <main>
      <ImageGeneratorPage />
    </main>
  );
}
