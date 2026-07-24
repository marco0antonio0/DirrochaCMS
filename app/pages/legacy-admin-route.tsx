"use client"

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { adminPath } from "@/app/lib/admin-path";
import { siteService } from "@/backend/site/site.service";

export default function LegacyAdminRoute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkBlogMode() {
      try {
        const settings = await siteService.getSettings();
        if (settings.blogEnabled) {
          router.replace(adminPath(pathname));
          return;
        }
      } finally {
        setChecking(false);
      }
    }

    checkBlogMode();
  }, [pathname, router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <span className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </main>
    );
  }

  return <>{children}</>;
}
