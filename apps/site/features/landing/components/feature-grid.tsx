import { features } from "../content"

export function FeatureGrid() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex flex-col gap-4 bg-background p-6">
            <span className="flex size-9 items-center justify-center rounded-lg bg-chart-1/50 text-chart-3 dark:bg-chart-5/60 dark:text-chart-2">
              <Icon className="size-4.5" aria-hidden />
            </span>
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-medium">{title}</h2>
              <p className="text-sm text-pretty text-muted-foreground">
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
