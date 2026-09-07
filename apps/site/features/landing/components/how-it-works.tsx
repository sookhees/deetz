import { steps } from "../content"
import { Eyebrow, Numeral } from "./labels"

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-20 sm:py-28">
        <div className="flex flex-col gap-3">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            From an empty subscription to a first answer, in minutes.
          </h2>
        </div>
        <ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, body }, index) => (
            <li key={title} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-chart-1/60 text-chart-3 dark:bg-chart-5/70 dark:text-chart-2">
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <Numeral index={index} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-medium">{title}</h3>
                <p className="text-sm text-pretty text-muted-foreground">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
