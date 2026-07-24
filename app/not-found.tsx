import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[calc(100vh-88px)] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-12">
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute -left-20 top-16 h-44 w-44 animate-[float_7s_ease-in-out_infinite] rounded-full border border-blue-200/80" />
      <div className="absolute -right-16 bottom-20 h-36 w-36 animate-[float_8s_ease-in-out_infinite_reverse] rounded-full border border-indigo-200/80" />

      <section className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 animate-[float_4s_ease-in-out_infinite] items-center justify-center rounded-2xl bg-white text-blue-700 shadow-xl ring-1 ring-blue-100">
          <SearchX className="h-10 w-10" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">Erro 404</p>
        <h1 className="mt-3 text-5xl font-semibold text-slate-950 smi:text-7xl">Página não encontrada</h1>
        <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
          A rota que você tentou acessar não existe ou foi movida dentro do DirrochaCMS.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 smi:w-auto smi:flex-row">
          <Button asChild className="h-12">
            <Link href="/home">
              <Home className="mr-2 h-4 w-4" />
              Ir para o painel
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 bg-white/70">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao início
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
