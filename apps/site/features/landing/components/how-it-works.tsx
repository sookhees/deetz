import { steps } from "../content"
import { Eyebrow, Numeral } from "./labels"

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-28">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-3">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            From an empty subscription to a first answer, in minutes.
          </h2>
        </div>
        <ol className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {steps.map(({ title, body }, index) => (
            <li key={title} className="flex flex-col gap-3">
              <Numeral index={index} />
              <h3 className="text-base font-medium">{title}</h3>
              <p className="text-sm text-pretty text-muted-foreground">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
