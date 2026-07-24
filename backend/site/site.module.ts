import { siteController, SiteController } from "@/backend/site/site.controller";
import { siteRepository, SiteRepository } from "@/backend/site/site.repository";
import { siteService, SiteService } from "@/backend/site/site.service";

export class SiteModule {
  readonly controller: SiteController;
  readonly service: SiteService;
  readonly repository: SiteRepository;

  constructor() {
    this.repository = siteRepository;
    this.service = siteService;
    this.controller = siteController;
  }
}

export const siteModule = new SiteModule();
