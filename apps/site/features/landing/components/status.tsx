import { roadmap } from "../content"
import { Eyebrow, Numeral } from "./labels"

export function Status() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-28">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Eyebrow>Status</Eyebrow>
          <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Nothing to install yet.
          </h2>
          <p className="max-w-md text-sm text-pretty text-muted-foreground">
            Open source under MIT, built in public one working commit at a time.
            In this order.
          </p>
        </div>
        <ol className="flex flex-col divide-y divide-border rounded-3xl bg-card px-6 py-2 ring-1 ring-foreground/5 dark:ring-foreground/10">
          {roadmap.map((item, index) => (
            <li key={item} className="flex items-baseline gap-4 py-3 text-sm">
              <Numeral index={index} />
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
