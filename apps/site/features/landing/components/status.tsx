import { roadmap } from "../content"
import { Eyebrow, Numeral } from "./labels"

export function Status() {
  return (
    <section className="border-t border-border bg-muted/40">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-20 sm:grid-cols-2 sm:py-28">
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
        <ol className="flex flex-col divide-y divide-border border-y border-border">
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
