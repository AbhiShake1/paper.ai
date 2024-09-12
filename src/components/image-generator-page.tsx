/**
* This code was generated by v0 by Vercel.
* @see https://v0.dev/t/kJ05DzzZJPT
* Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
*/

/** Add fonts into your Next.js project:

import { Inter } from 'next/font/google'

inter({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
"use client"

import { ReactNode, useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useMutation } from "@tanstack/react-query"
import { generateText } from "@/ai/generate-text"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { SizeIcon } from "@radix-ui/react-icons"

function useGenerateMutation({ onComplete }: { onComplete: (child: ReactNode) => void }) {
  return useMutation({
    mutationFn: generateText,
    onError: console.error,
    onSuccess: (text) => {
      let child = <div>{JSON.stringify(text)}</div>
      switch (text.type) {
        case "text":
          child = <div>{text.value}</div>
          break;
        case "image":
          console.log(text.value)
          child = <Image src={text.value} height={1024} width={1024} alt="wallpaper" className="w-full h-full" />
          break;
      }

      onComplete(child)
    },
  })
}

export function ImageGeneratorPage() {
  const [customElements, setCustomElements] = useState([
    { name: "weather" },
  ])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [component, setComponent] = useState<React.ReactNode>(null)

  const generateUrlMutation = useGenerateMutation({
    onComplete: (child) => setComponent(child),
  })

  const handleCustomElementsChange = (index: number, newName: string) => {
    const newElements = [...customElements]
    if (!!newElements[index])
      newElements[index].name = newName
    setCustomElements(newElements)
  }
  const handleCustomElementRemove = (index: number) => {
    const newElements = [...customElements]
    newElements.splice(index, 1)
    setCustomElements(newElements)
  }
  const handleAddCustomElement = () => {
    setCustomElements([...customElements, { name: '' }])
  }
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }
  return (
    <div className={`flex h-screen ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
      <div className={`flex-1 bg-background ${isFullscreen ? "h-full" : ""}`}>
        <div className={cn("relative h-full", isFullscreen && "overflow-hidden", generateUrlMutation.isPending && !!component && "animate-pulse")}>
          {
            component ||
            <img
              src="/placeholder.svg"
              alt="Wallpaper Preview"
              className={cn("absolute inset-0 w-full h-full object-cover", generateUrlMutation.isPending && "animate-spin")}
            />
          }
          <div
            className={`absolute inset-0 bg-gradient-to-r mix-blend-overlay`}
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            <Button
              variant={isFullscreen ? "outline" : "default"}
              onClick={toggleFullscreen}
              className={cn("flex items-center gap-2", isFullscreen && "opacity-0 hover:opacity-100")}
            >
              <SizeIcon className="w-4 h-4" />
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </Button>
          </div>
        </div>
      </div>
      <div className={`w-80 bg-muted p-6 flex flex-col h-screen gap-6 ${isFullscreen ? "hidden" : ""}`}>
        <div>
          <h2 className="text-xl font-bold">Paper AI</h2>
          <div className="mt-2" />
        </div>
        <div>
          <div>
            <h2 className="text-xl font-bold">Parameters</h2>
            <div className="mt-2 flex flex-col gap-2">
              <ScrollArea className="h-[75vh]">
                <div className="grid grid-cols-1 gap-2">
                  {customElements.map((element, index) => (
                    <div key={index} className="flex items-center justify-between bg-background p-2 rounded-md">
                      <Input
                        name={`param-${index}`}
                        value={element.name}
                        onChange={(e) => handleCustomElementsChange(index, e.target.value)}
                        className="flex-1 mr-2"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCustomElementRemove(index)}
                        className="opacity-100"
                      >
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-background p-2 rounded-md">
                    <Input value="Add" disabled className="flex-1 mr-2" />
                    <Button variant="ghost" size="icon" onClick={handleAddCustomElement}>
                      <PlusIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-auto">
          <Button className="flex-1 flex items-center gap-2" disabled={customElements.length > 0 && generateUrlMutation.isPending} onClick={() => generateUrlMutation.mutate(`generate a wallpaper based on following parameters : ${customElements.map(c => c.name).join(", ")}`)}>
            <DownloadIcon className="w-4 h-4" />
            Generate Wallpaper
          </Button>
        </div>
      </div>
    </div>
  )
}

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}


function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}


function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
