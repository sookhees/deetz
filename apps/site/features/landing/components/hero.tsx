import { GithubLogoIcon } from "@phosphor-icons/react/ssr"

import { buttonVariants } from "@deetz/ui/components/button"
import { site } from "@/lib/site"

import { apps } from "../content"
import { ComposerPreview } from "./composer-preview"
import { Eyebrow } from "./labels"

export function Hero() {
  return (
    <section>
      <div className="mx-auto w-full max-w-7xl px-6 pt-16 pb-16 sm:pt-24 sm:pb-20">
        <div className="flex flex-col items-center gap-12">
          <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              Stop searching
              <span className="block">Start asking</span>
            </h1>
            <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
              {site.name} is an open-source assistant that answers from your
              Microsoft 365, as the person asking, inside your own Azure
              tenant. No Copilot licence. Nothing leaves.
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
          </div>
          <div className="flex flex-col items-center gap-4 pt-4">
            <Eyebrow>Reads from</Eyebrow>
            <ul className="flex flex-wrap justify-center gap-2">
              {apps.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm"
                >
                  <Icon
                    className="size-4 text-chart-3 dark:text-chart-2"
                    aria-hidden
                  />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
