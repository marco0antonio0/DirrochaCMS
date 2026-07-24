"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Database } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { adminPath } from "@/app/lib/admin-path"

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
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-3 smi:px-6 lgi:px-8">
        <div className="flex min-h-16 items-center justify-between gap-2 py-2 smi:gap-3 smi:py-0">
          <div className="flex min-w-0 items-center">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={handleBack} className="mr-1 h-9 shrink-0 px-2 smi:px-3">
                <ArrowLeft className="h-4 w-4 smi:mr-2" />
                <span className="hidden smi:inline">Voltar</span>
              </Button>
            )}

            <button
              type="button"
              onClick={() => router.push(adminPath("/home"))}
              className="flex min-w-0 items-center gap-2 smi:gap-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600">
                <Database className="h-4 w-4 text-white" />
              </div>
              <h1 className="truncate text-base font-bold text-gray-900 smi:text-xl">DirrochaCMS</h1>
            </button>

            {page && (
              <div className="hidden smi:flex items-center min-w-0 ml-2">
                <span className="mx-2 text-gray-300">/</span>
                <span className="text-sm font-medium text-gray-600 truncate">{page}</span>
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
    </header>
  )
}
