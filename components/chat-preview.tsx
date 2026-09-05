import {
  ArrowUpIcon,
  FileTextIcon,
  MicrophoneIcon,
} from "@phosphor-icons/react/ssr"

export function ChatPreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div
        aria-hidden
        className="absolute -inset-12 -z-10 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)] bg-[size:14px_14px]"
      />
      <div
        role="img"
        aria-label="A preview of the Deetz chat panel answering a question from a SharePoint document."
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
            d
          </span>
          <div className="flex flex-col">
            <span className="text-sm leading-tight font-medium">deetz</span>
            <span className="text-xs text-muted-foreground">
              Answers from your Microsoft 365
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3 px-4 py-5 text-sm">
          <p className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-foreground px-3.5 py-2 text-background">
            How many days of annual leave do new starters get?
          </p>
          <div className="flex max-w-[85%] flex-col gap-2 self-start rounded-2xl rounded-bl-md bg-muted px-3.5 py-2">
            <p>25 days plus public holidays, rising to 28 after five years.</p>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileTextIcon className="size-3.5 shrink-0" aria-hidden />
              People › Leave policy 2026.docx
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-border px-3 py-3">
          <span className="flex-1 truncate rounded-full border border-input px-3.5 py-2 text-sm text-muted-foreground">
            Ask about anything in your tenant
          </span>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground">
            <MicrophoneIcon className="size-4" aria-hidden />
          </span>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
            <ArrowUpIcon className="size-4" aria-hidden />
          </span>
        </div>
      </div>
      <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
        Preview
      </p>
    </div>
  )
}
