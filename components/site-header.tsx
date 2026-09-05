import Link from "next/link"
import { GithubLogoIcon } from "@phosphor-icons/react/ssr"

import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          deetz
        </Link>
        <nav className="flex items-center gap-1">
          <a
            href={site.repo}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <GithubLogoIcon data-icon="inline-start" aria-hidden />
            GitHub
          </a>
        </nav>
      </div>
    </header>
  )
}
