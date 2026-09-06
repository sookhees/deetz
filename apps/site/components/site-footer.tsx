import { site } from "@/lib/site"

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-6 py-8 text-xs text-pretty text-muted-foreground">
        <p>
          {site.name} is an independent open-source project, not affiliated
          with or endorsed by Microsoft.
        </p>
        <p>
          Microsoft, Azure, Copilot, Entra, Microsoft 365, SharePoint and Teams
          are trademarks of the Microsoft group of companies.
        </p>
      </div>
    </footer>
  )
}
