import { ImageGeneratorPage } from "@/components/image-generator-page";

export const maxDuration = 300

export default async function Home() {
  return (
    <main>
      <ImageGeneratorPage />
    </main>
  );
}
