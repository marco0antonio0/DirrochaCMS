"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { Database, Settings } from "lucide-react";
import LoginPage from "@/app/pages";
import { Button } from "@/app/components/ui/button";
import { siteService } from "@/backend/site/site.service";
import { endpointService } from "@/backend/endpoint/endpoint.service";
import { itemService } from "@/backend/item/item.service";
import { adminPath } from "@/app/lib/admin-path";

const getField = (post: any, keys: string[]) => {
  const data = post?.formattedData || {};
  for (const key of keys) {
    if (data[key]) return data[key];
  }
  return "";
};

export default function PublicSitePage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);

  useEffect(() => {
    async function loadSite() {
      try {
        const siteSettings = await siteService.getSettings();
        setSettings(siteSettings);

        if (!siteSettings.blogEnabled) return;

        const endpoints: any = await endpointService.listEndpoints();
        const postsEndpoint = endpoints.data?.find((item: any) => item.router === siteSettings.postsEndpoint);
        const pagesEndpoint = endpoints.data?.find((item: any) => item.router === siteSettings.pagesEndpoint);

        if (postsEndpoint) {
          const items: any = await itemService.getItems(postsEndpoint.id);
          setPosts(items.data || []);
        }

        if (pagesEndpoint) {
          const items: any = await itemService.getItems(pagesEndpoint.id);
          setPages(items.data || []);
        }
      } finally {
        setLoading(false);
      }
    }

    loadSite();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <span className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </main>
    );
  }

  if (!settings?.blogEnabled) {
    return <LoginPage />;
  }

  const homePage = settings.homeLayout === "page"
    ? pages.find((page) => (getField(page, ["titulo_identificador"]) || page.id) === settings.homePageSlug)
    : null;
  const primaryColor = settings.primaryColor || "#2563EB";

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 smi:px-6 mdi:flex-row mdi:items-center mdi:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: primaryColor }}>
              <Database className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-slate-950">{settings.title}</h1>
              <p className="hidden truncate text-sm text-slate-500 smi:block">{settings.description}</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <Link href="/" className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Início
            </Link>
            {pages.slice(0, 5).map((page) => {
              const title = getField(page, ["titulo", "title", "nome"]) || "Página";
              const slug = getField(page, ["titulo_identificador"]) || page.id;
              return (
                <Link key={page.id} href={`/${slug}`} className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  {title}
                </Link>
              );
            })}
            <Button asChild variant="outline" size="sm">
              <Link href={adminPath()}>
                <Settings className="mr-2 h-4 w-4" />
                CMS
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-10 smi:px-6 smi:py-14">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase" style={{ color: primaryColor }}>Site</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950 smi:text-5xl">{settings.title}</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">{settings.description}</p>
        </div>

        {homePage ? (
          <article className="mt-10 rounded-lg bg-white p-5 shadow-sm smi:p-8">
            <h3 className="text-2xl font-semibold text-slate-950">
              {getField(homePage, ["titulo", "title", "nome"]) || "Página inicial"}
            </h3>
            {getField(homePage, ["descricao", "resumo"]) ? (
              <p className="mt-3 text-lg leading-8 text-slate-600">{getField(homePage, ["descricao", "resumo"])}</p>
            ) : null}
            <div className="mt-6 whitespace-pre-line text-base leading-8 text-slate-700">
              {getField(homePage, ["artigo", "conteudo", "texto"]) || "Configure o conteúdo desta página no CMS."}
            </div>
          </article>
        ) : posts.length === 0 ? (
          <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            Nenhum post publicado ainda.
          </div>
        ) : (
          <div className="mt-10 grid gap-5 mdi:grid-cols-2 lgi:grid-cols-3">
            {posts.map((post) => {
              const title = getField(post, ["titulo", "title", "nome"]) || "Sem título";
              const description = getField(post, ["descricao", "breve_descricao", "resumo"]);
              const image = getField(post, ["image", "imagem"]);
              const slug = getField(post, ["titulo_identificador"]) || post.id;

              return (
                <Link
                  key={post.id}
                  href={`/${slug}`}
                  className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  {image ? (
                    <img src={image} alt="" className="h-44 w-full object-cover" />
                  ) : (
                    <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700">
                      <Database className="h-10 w-10" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-lg font-semibold text-slate-950">{title}</h3>
                    {description ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{description}</p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
