import { site } from "@/lib/site"

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          {site.name} is open source under the{" "}
          <a
            href={`${site.repo}/blob/main/LICENSE`}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            MIT licence
          </a>
          .
        </p>
        <a
          href={site.repo}
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground"
        >
          GitHub
        </a>
      </div>
    </footer>
  )
}
