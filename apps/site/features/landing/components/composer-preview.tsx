import { ArrowUpIcon, MicrophoneIcon } from "@phosphor-icons/react/ssr"

import { Card, CardContent } from "@deetz/ui/components/card"

export function ComposerPreview() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card
        size="sm"
        role="img"
        aria-label="A preview of the Deetz composer: a question, a microphone and a send button."
        className="px-2 py-3"
      >
        <CardContent className="flex items-center gap-4 pr-3">
          <p className="flex-1 text-base text-muted-foreground sm:text-lg">
            Where&apos;s the Q3 budget?
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
