import { ArrowUpRightIcon, GithubLogoIcon } from "@phosphor-icons/react/ssr"

import { buttonVariants } from "@deetz/ui/components/button"
import { site } from "@/lib/site"

import { ComposerPreview } from "./composer-preview"

export function Hero() {
  return (
    <section className="border-b border-border bg-muted/60">
      <div className="mx-auto w-full max-w-7xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="flex flex-col items-center gap-12">
          <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              Stop searching
              <span className="block">Start asking</span>
            </h1>
            <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
              {site.name} is an open-source assistant that answers from your
              files, mail, calendar and Teams, as the person asking, inside your
              own Azure tenant. No Copilot licence. Nothing leaves.
            </p>
          </div>
          <ComposerPreview />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={site.repo}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ size: "lg" })}
            >
              <GithubLogoIcon data-icon="inline-start" aria-hidden />
              View on GitHub
            </a>
            <a
              href={`${site.repo}/blob/main/docs/design.md`}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "ghost", size: "lg" })}
            >
              Read the design
              <ArrowUpRightIcon data-icon="inline-end" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
