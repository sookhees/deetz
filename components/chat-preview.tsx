import {
  ArrowUpIcon,
  FileTextIcon,
  MicrophoneIcon,
} from "@phosphor-icons/react/ssr"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function ChatPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md zoom-[0.93]">
      <Card
        role="img"
        aria-label="A preview of the Deetz chat panel answering one question from Outlook and one from a SharePoint document."
      >
        <CardHeader className="flex flex-row items-center gap-3 border-b">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-chart-3 text-sm font-bold text-background dark:bg-chart-2">
            d
          </span>
          <div className="flex flex-col">
            <CardTitle>deetz</CardTitle>
            <CardDescription>Answers from your Microsoft 365</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex min-h-96 flex-col justify-end gap-4">
          <p className="max-w-[80%] self-end rounded-lg bg-foreground px-4 py-2.5 leading-relaxed text-background">
            Anything new from Priya about the Q3 budget?
          </p>
          <div className="flex max-w-[85%] flex-col gap-3 self-start rounded-lg bg-muted px-4 py-3 leading-relaxed">
            <p>
              One email this morning. She has approved the figures and wants the
              summary by Friday.
            </p>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-background py-1 pr-3 pl-2 text-xs font-medium">
              <FileTextIcon
                className="size-3.5 shrink-0 text-chart-3 dark:text-chart-2"
                aria-hidden
              />
              Outlook › Re: Q3 budget
            </span>
          </div>
          <p className="max-w-[80%] self-end rounded-lg bg-foreground px-4 py-2.5 leading-relaxed text-background">
            Where is the latest travel policy?
          </p>
          <div className="flex max-w-[85%] flex-col gap-3 self-start rounded-lg bg-muted px-4 py-3 leading-relaxed">
            <p>
              In the Finance site, updated in March. Flights over four hours can
              be booked in premium economy.
            </p>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-background py-1 pr-3 pl-2 text-xs font-medium">
              <FileTextIcon
                className="size-3.5 shrink-0 text-chart-3 dark:text-chart-2"
                aria-hidden
              />
              Finance › Travel policy 2026.docx
            </span>
          </div>
        </CardContent>
        <CardFooter className="gap-2 border-t">
          <span className="flex h-10 flex-1 items-center rounded-full border border-input px-4 text-muted-foreground">
            Ask about anything in your tenant
          </span>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground">
            <MicrophoneIcon className="size-4" aria-hidden />
          </span>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-chart-3 text-background dark:bg-chart-2">
            <ArrowUpIcon className="size-4" aria-hidden />
          </span>
        </CardFooter>
      </Card>
      <p className="mt-4 text-center font-mono text-xs text-chart-3 dark:text-chart-2">
        Preview
      </p>
    </div>
  )
}
