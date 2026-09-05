import {
  AppWindowIcon,
  ArrowUpRightIcon,
  EyeIcon,
  GaugeIcon,
  GithubLogoIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react/ssr"

import { ChatPreview } from "@/components/chat-preview"
import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"

const features = [
  {
    icon: ShieldCheckIcon,
    title: "Runs in your tenant",
    body: "One azd up provisions the app and its Azure OpenAI deployments into the subscription you are signed into. Nothing is hosted by anyone else.",
  },
  {
    icon: EyeIcon,
    title: "Sees what they see",
    body: "Questions go through Microsoft Graph as the signed-in person, with their permissions. Nothing is copied out or indexed elsewhere.",
  },
  {
    icon: AppWindowIcon,
    title: "Embeds in a page",
    body: "A chat widget for an intranet or a site. Ask out loud or type, and it is one conversation either way.",
  },
  {
    icon: GaugeIcon,
    title: "Carries its own limits",
    body: "Rate limits, a daily spend ceiling and per-user quotas live in the app, so what you install is safe to expose.",
  },
]

const steps = [
  {
    title: "Install",
    body: "Run azd up. Bicep provisions the app, its database and the model deployments into your tenant.",
  },
  {
    title: "Embed",
    body: "Drop the widget onto a page. People sign in with the Entra ID accounts they already have.",
  },
  {
    title: "Ask",
    body: "They ask in their own words, out loud or typed, and get an answer from your own content.",
  },
]

const roadmap = [
  "The widget shell, composer and transcript",
  "The agent route and system prompt",
  "Voice: transcription in, sentence-chunked speech out",
  "Self-service setup: azd up, Bicep templates, a Dockerfile",
  "The end-to-end browser suite",
]

export default function Page() {
  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              <span
                className="size-1.5 rounded-full bg-foreground"
                aria-hidden
              />
              Open source, building in public
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Answers from your Microsoft 365, inside your own tenant.
            </h1>
            <p className="max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
              {site.name} is an AI assistant that answers questions from
              SharePoint, OneDrive and mail, as the person asking. It runs on
              your Azure subscription. No Copilot licence, no per-seat cost, no
              data leaving the tenant.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
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
                href={`${site.repo}#roadmap`}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "ghost", size: "lg" })}
              >
                Read the roadmap
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
              {site.name} is being built one working commit at a time, from a
              private prototype. This is the order it will land in.
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
