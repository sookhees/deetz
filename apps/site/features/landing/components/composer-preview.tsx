"use client"

import { useEffect, useState } from "react"
import { ArrowUpIcon, MicrophoneIcon } from "@phosphor-icons/react/ssr"

import { Card, CardContent } from "@deetz/ui/components/card"

import { questions } from "../content"

const first = questions[0] ?? ""

const typeDelay = 55
const eraseDelay = 25
const holdDelay = 2200
const restDelay = 400

type Phase = "typing" | "erasing"

function useTypedQuestion() {
  const [index, setIndex] = useState(0)
  const [length, setLength] = useState(first.length)
  const [phase, setPhase] = useState<Phase>("typing")
  const question = questions[index] ?? ""

  useEffect(() => {
    let delay = typeDelay
    let advance = () => setLength(length + 1)

    if (phase === "typing" && length >= question.length) {
      delay = holdDelay
      advance = () => setPhase("erasing")
    } else if (phase === "erasing" && length > 0) {
      delay = eraseDelay
      advance = () => setLength(length - 1)
    } else if (phase === "erasing") {
      delay = restDelay
      advance = () => {
        setIndex((index + 1) % questions.length)
        setPhase("typing")
      }
    }

    const timer = window.setTimeout(advance, delay)
    return () => window.clearTimeout(timer)
  }, [index, length, phase, question])

  return question.slice(0, length)
}

export function ComposerPreview() {
  const text = useTypedQuestion()

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card
        size="sm"
        role="img"
        aria-label="A preview of the Deetz composer: a question being typed, a microphone and a send button."
        className="px-2 py-3"
      >
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
    </div>
  )
}
