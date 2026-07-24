import { Github } from "lucide-react";

export function FooterComponent(){
    return (
    <footer className="flex w-full items-center justify-center border-t border-slate-200 bg-white/80 px-4 py-5">
        <a
          className="mx-auto inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-700 hover:underline hover:underline-offset-4"
          href="https://github.com/marco0antonio0/DirrochaCMS"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github aria-hidden className="h-4 w-4" />
          Desenvolvido por @marco0antonio0
        </a>
      </footer>
    )
}
