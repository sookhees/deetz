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
      <div
        aria-hidden
        className="absolute -inset-12 -z-10 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_center,black_35%,transparent_75%)] bg-size-[14px_14px]"
      />
      <Card
        role="img"
        aria-label="A preview of the Deetz chat panel answering a question from a SharePoint document."
      >
        <CardHeader className="flex flex-row items-center gap-3 border-b">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
            d
          </span>
          <div className="flex flex-col">
            <CardTitle>deetz</CardTitle>
            <CardDescription>Answers from your Microsoft 365</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex min-h-96 flex-col justify-end gap-4">
          <p className="max-w-[80%] self-end rounded-3xl bg-foreground px-5 py-3 leading-relaxed text-background">
            How many days of annual leave do new starters get?
          </p>
          <div className="flex max-w-[85%] flex-col gap-2.5 self-start rounded-3xl bg-muted px-5 py-3.5 leading-relaxed">
            <p>25 days plus public holidays, rising to 28 after five years.</p>
            <span className="flex items-center gap-1.5 border-t border-border pt-2.5 text-xs text-muted-foreground">
              <FileTextIcon className="size-3.5 shrink-0" aria-hidden />
              People › Leave policy 2026.docx
            </span>
          </div>
          <p className="max-w-[80%] self-end rounded-3xl bg-foreground px-5 py-3 leading-relaxed text-background">
            Does that include the shutdown days over Christmas?
          </p>
          <div className="flex max-w-[85%] flex-col gap-2.5 self-start rounded-3xl bg-muted px-5 py-3.5 leading-relaxed">
            <p>
              No. The three shutdown days are on top of your 25, and Facilities
              sets the dates each year.
            </p>
            <span className="flex items-center gap-1.5 border-t border-border pt-2.5 text-xs text-muted-foreground">
              <FileTextIcon className="size-3.5 shrink-0" aria-hidden />
              Facilities › Holiday closure 2026.docx
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
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
            <ArrowUpIcon className="size-4" aria-hidden />
          </span>
        </CardFooter>
      </Card>
      <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
        Preview
      </p>
    </div>
  )
}
