import { db } from "@/backend/config/config";
import { SITE_SETTINGS_COLLECTION, SITE_SETTINGS_DOC } from "@/backend/site/site.entity";
import type { SiteSettings } from "@/backend/site/site.model";
import { doc, getDoc, setDoc } from "firebase/firestore";

export class SiteRepository {
  async getSettings(): Promise<SiteSettings> {
    const settingsRef = doc(db, SITE_SETTINGS_COLLECTION, SITE_SETTINGS_DOC);
    const settingsDoc = await getDoc(settingsRef);

    if (!settingsDoc.exists()) {
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

    const data = settingsDoc.data();
    return {
      blogEnabled: data.blogEnabled ?? false,
      title: data.title ?? "DirrochaCMS Blog",
      description: data.description ?? "Conteúdos publicados pelo DirrochaCMS.",
      postsEndpoint: data.postsEndpoint ?? "",
      pagesEndpoint: data.pagesEndpoint ?? "",
      primaryColor: data.primaryColor ?? "#2563EB",
      homeLayout: data.homeLayout ?? "blog",
      homePageSlug: data.homePageSlug ?? "",
    };
  }

  async setSettings(settings: SiteSettings) {
    const settingsRef = doc(db, SITE_SETTINGS_COLLECTION, SITE_SETTINGS_DOC);
    await setDoc(settingsRef, settings);
    return { success: true };
  }
}

export const siteRepository = new SiteRepository();
