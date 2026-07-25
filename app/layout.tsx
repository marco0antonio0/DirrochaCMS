import type { ReactNode } from "react";
import { FooterComponent } from "@/app/components/footer";
import { CurrentUserProvider } from "@/app/hooks/useCurrentUser";
import "@/app/styles/globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Dirrocha CMS",
  description: "Plataforma de gerenciamento de conteúdos e endpoints",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontSize: "18px",
              padding: "16px",
              width: "400px",
              borderRadius: "10px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            },
          }}
        />
        <CurrentUserProvider>
          <div className="flex-1">{children}</div>
        </CurrentUserProvider>
        <FooterComponent />
      </body>
    </html>
  );
}
