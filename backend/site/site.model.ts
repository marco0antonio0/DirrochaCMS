export interface SiteSettings {
  blogEnabled: boolean;
  title: string;
  description: string;
  postsEndpoint: string;
  pagesEndpoint: string;
  primaryColor: string;
  homeLayout: "blog" | "page";
  homePageSlug: string;
}
