import { features } from "../content"
import { Eyebrow } from "./labels"

export function FeatureGrid() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-28">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-3">
          <Eyebrow>What it does</Eyebrow>
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Your Microsoft 365, asked in plain words.
          </h2>
        </div>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="flex flex-col gap-5 rounded-3xl bg-card p-6 ring-1 ring-foreground/5 dark:ring-foreground/10"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-chart-1/60 text-chart-3 dark:bg-chart-5/70 dark:text-chart-2">
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-medium">{title}</h3>
                <p className="text-sm text-pretty text-muted-foreground">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
