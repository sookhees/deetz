import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "@deetz/ui/globals.css"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@deetz/ui/components/theme-provider"
import { site } from "@/lib/site"
import { cn } from "@deetz/ui/lib/utils"

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "font-sans antialiased",
        fontSans.variable,
        fontMono.variable
      )}
    >
      <body className="min-h-svh">
        <ThemeProvider>
          <SiteHeader />
          <main className="pt-14">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  )
}
