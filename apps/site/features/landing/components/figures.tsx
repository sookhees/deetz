import { figures, figuresCaption } from "../content"

export function Figures() {
  return (
    <section className="bg-chart-4 text-chart-1">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-16 sm:py-20">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
          {figures.map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-2">
              <dd className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {value}
              </dd>
              <dt className="text-sm text-chart-1/70">{label}</dt>
            </div>
          ))}
        </dl>
        <p className="text-sm text-chart-1/70">{figuresCaption}</p>
      </div>
    </section>
  )
}
