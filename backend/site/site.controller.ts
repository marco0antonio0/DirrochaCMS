import { siteService, SiteService } from "@/backend/site/site.service";

export class SiteController {
  constructor(private readonly service: SiteService) {}

  getSettings = this.service.getSettings.bind(this.service);
  setSettings = this.service.setSettings.bind(this.service);
}

export const siteController = new SiteController(siteService);
