"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Database, Settings } from "lucide-react";
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

export default function PublicPostPage({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [contentType, setContentType] = useState<"page" | "post">("post");

  useEffect(() => {
    async function loadPost() {
      try {
        const siteSettings = await siteService.getSettings();
        setSettings(siteSettings);
        if (!siteSettings.blogEnabled) return;

        const endpoints: any = await endpointService.listEndpoints();
        const pagesEndpoint = endpoints.data?.find((item: any) => item.router === siteSettings.pagesEndpoint);
        const postsEndpoint = endpoints.data?.find((item: any) => item.router === siteSettings.postsEndpoint);

        if (pagesEndpoint) {
          const pages: any = await itemService.getItems(pagesEndpoint.id);
          const foundPage = pages.data?.find((item: any) => (getField(item, ["titulo_identificador"]) || item.id) === slug);
          if (foundPage) {
            setContent(foundPage);
            setContentType("page");
            return;
          }
        }

        if (postsEndpoint) {
          const posts: any = await itemService.getItems(postsEndpoint.id);
          const foundPost = posts.data?.find((item: any) => (getField(item, ["titulo_identificador"]) || item.id) === slug);
          if (foundPost) {
            setContent(foundPost);
            setContentType("post");
          }
        }
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <span className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </main>
    );
  }

  if (!settings?.blogEnabled || !content) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-slate-950">Post não encontrado</h1>
          <p className="mt-2 text-slate-600">O conteúdo não existe ou o blog público está desabilitado.</p>
          <Button asChild className="mt-6">
            <Link href="/">Voltar ao site</Link>
          </Button>
        </div>
      </main>
    );
  }

  const title = getField(content, ["titulo", "title", "nome"]) || "Sem título";
  const description = getField(content, ["descricao", "breve_descricao", "resumo"]);
  const body = getField(content, ["artigo", "conteudo", "texto"]) || description;
  const image = getField(content, ["image", "imagem"]);
  const primaryColor = settings.primaryColor || "#2563EB";

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 smi:px-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={adminPath()}>
              <Settings className="mr-2 h-4 w-4" />
              CMS
            </Link>
          </Button>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-4 py-10 smi:px-6 smi:py-14">
        <p className="text-sm font-semibold uppercase" style={{ color: primaryColor }}>
          {contentType === "page" ? "Página" : settings.title}
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 smi:text-5xl">{title}</h1>
        {description ? <p className="mt-4 text-lg leading-8 text-slate-600">{description}</p> : null}

        {image ? (
          <img src={image} alt="" className="mt-8 max-h-[460px] w-full rounded-lg object-cover shadow-sm" />
        ) : (
          <div className="mt-8 flex h-64 w-full items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700">
            <Database className="h-12 w-12" />
          </div>
        )}

        <div className="mt-8 whitespace-pre-line rounded-lg bg-white p-5 text-base leading-8 text-slate-700 shadow-sm smi:p-8">
          {body || "Sem conteúdo para exibir."}
        </div>
      </article>
    </main>
  );
}
