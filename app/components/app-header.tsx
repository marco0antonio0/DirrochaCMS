"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronRight, Database } from "lucide-react"
import { Button } from "@/app/components/ui/button"

interface AppHeaderProps {
  /** Label shown after the logo as a breadcrumb, e.g. "Configuration" or an endpoint name. Omit on the Home page itself. */
  page?: string
  /** Shows a Back button. Pass a href to navigate there, or a function for custom back behavior (e.g. closing an in-page view). */
  onBack?: string | (() => void)
  /** Right-aligned buttons/menus. */
  actions?: ReactNode
}

export function AppHeader({ page, onBack, actions }: AppHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack()
    } else if (typeof onBack === "string") {
      router.push(onBack)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/75 shadow-[0_1px_3px_rgba(15,23,42,0.04)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-3 smi:px-6 lgi:px-8">
        <div className="flex min-h-16 items-center justify-between gap-2 py-2 smi:gap-3 smi:py-0">
          <div className="flex min-w-0 items-center gap-1 smi:gap-2">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-9 shrink-0 rounded-full px-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 smi:rounded-md smi:px-3"
              >
                <ArrowLeft className="h-4 w-4 smi:mr-2" />
                <span className="hidden smi:inline">Voltar</span>
              </Button>
            )}

            <button
              type="button"
              onClick={() => router.push("/home")}
              aria-label="Ir para a página inicial"
              className="group flex min-w-0 items-center gap-2 rounded-lg outline-none transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 smi:gap-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 shadow-md shadow-indigo-600/25 ring-1 ring-inset ring-white/25 transition duration-200 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-indigo-600/35">
                <Database className="h-[18px] w-[18px] text-white" />
              </span>
              <h1
                className={`truncate bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-base font-bold tracking-tight text-transparent smi:text-xl ${
                  page ? "hidden smi:block" : ""
                }`}
              >
                DirrochaCMS
              </h1>
            </button>

            {page && (
              <div className="flex min-w-0 items-center gap-1 smi:gap-2">
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                <span className="truncate rounded-full bg-slate-100/80 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200/80 smi:text-sm">
                  {page}
                </span>
              </div>
            )}
          </div>

          {actions ? (
            <div className="flex shrink-0 items-center justify-end gap-2">
              {actions}
            </div>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
    </header>
  )
}
