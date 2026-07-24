import { IsStartedfirebaseConfig } from "@/backend/config/config";
import { siteRepository, SiteRepository } from "@/backend/site/site.repository";
import type { SiteSettings } from "@/backend/site/site.model";

export class SiteService {
  constructor(private readonly repository: SiteRepository) {}

  async getSettings() {
    if (!IsStartedfirebaseConfig) {
      return {
        blogEnabled: false,
        title: "DirrochaCMS Blog",
        description: "Conteúdos publicados pelo DirrochaCMS.",
        postsEndpoint: "",
        pagesEndpoint: "",
        primaryColor: "#2563EB",
        homeLayout: "blog",
        homePageSlug: "",
      };
    }

    return this.repository.getSettings();
  }

  async setSettings(settings: SiteSettings) {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };
    return this.repository.setSettings(settings);
  }
}

export const siteService = new SiteService(siteRepository);
