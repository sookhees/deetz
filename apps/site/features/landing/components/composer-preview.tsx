"use client"

import { useEffect, useState } from "react"
import { ArrowUpIcon, MicrophoneIcon } from "@phosphor-icons/react/ssr"

import { Card, CardContent } from "@deetz/ui/components/card"
import { cn } from "@deetz/ui/lib/utils"

import { examples } from "../content"

const first = examples[0]

const typeDelay = 55
const eraseDelay = 25
const holdDelay = 3400
const restDelay = 400

type Phase = "typing" | "erasing"

function useTypedExample() {
  const [index, setIndex] = useState(0)
  const [length, setLength] = useState(first?.ask.length ?? 0)
  const [phase, setPhase] = useState<Phase>("typing")
  const example = examples[index] ?? first
  const ask = example?.ask ?? ""
  const complete = phase === "typing" && length >= ask.length

  useEffect(() => {
    let delay = typeDelay
    let advance = () => setLength(length + 1)

    if (phase === "typing" && length >= ask.length) {
      delay = holdDelay
      advance = () => setPhase("erasing")
    } else if (phase === "erasing" && length > 0) {
      delay = eraseDelay
      advance = () => setLength(length - 1)
    } else if (phase === "erasing") {
      delay = restDelay
      advance = () => {
        setIndex((index + 1) % examples.length)
        setPhase("typing")
      }
    }

    const timer = window.setTimeout(advance, delay)
    return () => window.clearTimeout(timer)
  }, [index, length, phase, ask])

  return { example, text: ask.slice(0, length), complete }
}

export function ComposerPreview() {
  const { example, text, complete } = useTypedExample()
  const SourceIcon = example?.source.icon

  return (
    <div
      role="img"
      aria-label="A preview of Deetz: a question being typed, then its answer with the document it came from."
      className="mx-auto w-full max-w-2xl"
    >
      <Card size="sm" className="px-2 py-3">
        <CardContent className="flex items-center gap-4 pr-3">
          <p className="flex-1 text-base whitespace-nowrap text-muted-foreground sm:text-lg">
            {text}
            <span
              aria-hidden
              className="ml-px inline-block h-[1.1em] w-0.5 translate-y-[0.18em] rounded-full bg-chart-3 motion-safe:animate-caret-blink dark:bg-chart-2"
            />
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground">
              <MicrophoneIcon className="size-4" aria-hidden />
            </span>
            <span className="flex size-8 items-center justify-center rounded-full bg-chart-3 text-background dark:bg-chart-2">
              <ArrowUpIcon className="size-4" aria-hidden />
            </span>
          </div>
        </CardContent>
      </Card>
      <div
        className={cn(
          "flex min-h-16 items-start gap-3 px-6 pt-4 transition-opacity duration-500",
          complete ? "opacity-100" : "opacity-0"
        )}
      >
        <span
          aria-hidden
          className="mt-2 size-2 shrink-0 rounded-full bg-chart-3 dark:bg-chart-2"
        />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <p className="text-sm text-foreground">{example?.answer}</p>
          {example && SourceIcon && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-chart-1/60 py-1 pr-2.5 pl-2 text-xs font-medium text-chart-3 dark:bg-chart-5/70 dark:text-chart-2">
              <SourceIcon className="size-3.5 shrink-0" aria-hidden />
              {example.source.label}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
