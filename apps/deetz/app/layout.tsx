import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "@deetz/ui/globals.css"
import { ThemeProvider } from "@deetz/ui/components/theme-provider"
import { cn } from "@deetz/ui/lib/utils"

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Deetz",
  description: "Ask your Microsoft 365 anything, inside your own tenant.",
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
