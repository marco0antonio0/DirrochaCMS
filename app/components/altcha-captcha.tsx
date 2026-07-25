"use client"

import { useEffect, useRef, useState } from "react"
import "altcha"
import "altcha/i18n/pt-br"
import type {} from "altcha/types/react"

type AltchaEvent = CustomEvent<{ payload?: string; state?: string }>

export function AltchaCaptcha({
  value,
  resetKey = 0,
  onChange,
}: {
  value: string
  resetKey?: number
  onChange: (value: string) => void
}) {
  const widgetRef = useRef<HTMLElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const widget = widgetRef.current
    if (!widget) return

    const syncPayload = (event: Event) => {
      const detail = (event as AltchaEvent).detail
      const payload =
        detail?.payload ||
        widget.querySelector<HTMLInputElement>('input[name="altcha"]')?.value ||
        ""

      if (event.type === "verified" || detail?.state === "verified") {
        onChange(payload)
        return
      }

      if (detail?.state && detail.state !== "verifying") {
        onChange("")
      }
    }

    widget.addEventListener("verified", syncPayload)
    widget.addEventListener("statechange", syncPayload)

    return () => {
      widget.removeEventListener("verified", syncPayload)
      widget.removeEventListener("statechange", syncPayload)
    }
  }, [onChange])

  useEffect(() => {
    if (widgetRef.current && "reset" in widgetRef.current) {
      ;(widgetRef.current as HTMLElement & { reset: () => void }).reset()
      onChange("")
    }
  }, [resetKey])

  if (!mounted) {
    return <div className="h-[74px] rounded-md border border-slate-200 bg-slate-50" />
  }

  return (
    <div key={resetKey} className="overflow-hidden rounded-md border border-slate-200 bg-white p-2">
      <altcha-widget
        ref={widgetRef}
        challenge="/api/captcha/challenge"
        name="altcha"
        type="checkbox"
        auto="off"
        language="pt-br"
        style={{
          "--altcha-max-width": "100%",
          "--altcha-border-width": "0px",
          "--altcha-color-primary": "oklch(48.8% 0.243 264.376)",
        }}
      />
    </div>
  )
}
