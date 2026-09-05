import {
  ArrowUpRightIcon,
  EyeIcon,
  GithubLogoIcon,
  MagnifyingGlassIcon,
  MicrophoneIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react/ssr"

import { ChatPreview } from "@/components/chat-preview"
import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"

const features = [
  {
    icon: MagnifyingGlassIcon,
    title: "Your own Microsoft 365",
    body: "Files, SharePoint, mail, calendar and Teams. It searches through Microsoft's own index, reads the document if it needs to, and cites what it used.",
  },
  {
    icon: EyeIcon,
    title: "Sees what you see",
    body: "Every search runs as the person asking, so their permissions are the boundary. Nothing is copied out, indexed elsewhere or sent to a vendor.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Runs in your tenant",
    body: "One azd up provisions the app and its Azure OpenAI deployments into your subscription, with a spend ceiling and quotas built in. You pay for tokens, not seats.",
  },
  {
    icon: MicrophoneIcon,
    title: "Speak or type",
    body: "Tap to talk and hear the answer read back as it is written. One conversation either way, on a laptop or a phone.",
  },
]

const steps = [
  {
    title: "Install",
    body: "Run azd up and consent once. Choose which sources your organisation allows and set a spend ceiling.",
  },
  {
    title: "Sign in",
    body: "People open Deetz with the Microsoft account they already have and pick what it may read for them. Mail stays off until they turn it on.",
  },
  {
    title: "Ask",
    body: "Out loud or typed. It searches, reads, answers, and says where the answer came from.",
  },
]

const roadmap = [
  "The chat panel, typed",
  "Sign-in with Microsoft Entra",
  "Search over your Microsoft 365 through Graph",
  "Voice: transcription in, sentence-chunked speech out",
  "Self-service install: azd up, Bicep templates, a Dockerfile",
  "The end-to-end browser suite",
]

export default function Page() {
  return (
    <>
      <section className="mx-auto w-full max-w-7xl overflow-hidden px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="flex flex-col items-center gap-16">
          <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              Talk to your business.
            </h1>
            <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
              {site.name} answers questions from your own Microsoft 365, your
              files, mail, calendar and Teams, as the person asking. It runs
              inside your Azure tenant. No Copilot licence, no per-seat cost,
              nothing leaves.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
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
          <ChatPreview />
        </div>
      </section>

      <section className="border-y border-border">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col gap-3 bg-background p-6">
              <Icon className="size-5 text-muted-foreground" aria-hidden />
              <h2 className="text-sm font-medium">{title}</h2>
              <p className="text-sm text-pretty text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-28">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
              How it works
            </p>
            <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              From an empty subscription to a first answer, in minutes.
            </h2>
          </div>
          <ol className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
            {steps.map(({ title, body }, index) => (
              <li key={title} className="flex flex-col gap-3">
                <span className="font-mono text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-base font-medium">{title}</h3>
                <p className="text-sm text-pretty text-muted-foreground">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-20 sm:grid-cols-2 sm:py-28">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
              Status
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Nothing to install yet.
            </h2>
            <p className="max-w-md text-sm text-pretty text-muted-foreground">
              {site.name} is being built in public, one working commit at a
              time. This is the order it lands in.
            </p>
          </div>
          <ol className="flex flex-col divide-y divide-border border-y border-border">
            {roadmap.map((item, index) => (
              <li key={item} className="flex items-baseline gap-4 py-3 text-sm">
                <span className="font-mono text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}
