import type { NextApiRequest, NextApiResponse } from "next";
import { normalizeString } from "@/backend/common/normalizeString";
import { endpointService, EndpointService } from "@/backend/endpoint/endpoint.service";
import { itemService, ItemService } from "@/backend/item/item.service";

export class EndpointController {
  constructor(
    private readonly endpoints: EndpointService,
    private readonly items: ItemService,
  ) {}

  handlePublicEndpoint = async (req: NextApiRequest, res: NextApiResponse<any>) => {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS, PATCH, DELETE, POST, PUT");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    );

    const { id, t } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Parâmetro não informado", statusCode: 400 });
    }

    const endpointId = Array.isArray(id) ? id[0] : id;
    const endpoints = await this.endpoints.listEndpoints();
    if (!endpoints || !("data" in endpoints) || !endpoints.data) {
      return res.status(500).json({ error: "Erro ao buscar endpoints", statusCode: 500 });
    }

    const endpointData: any[] = endpoints.data.filter((endpoint: any) => endpoint.router === endpointId);
    if (endpointData.length === 0) {
      return res.status(404).json({ error: "Rota não encontrada", statusCode: 404 });
    }

    const endpoint = endpointData[0];
    const accessMode = endpoint.accessMode || "public";
    if (accessMode === "password") {
      const providedPassword = this.getRequestPassword(req);
      if (!endpoint.accessPassword || providedPassword !== endpoint.accessPassword) {
        return res.status(401).json({ error: "Senha do endpoint inválida ou não informada", statusCode: 401 });
      }
    }

    if (endpoint.fixedValuesEnabled) {
      const ttl = Math.max(Number(endpoint.cacheTtlSeconds || 0), 0);
      res.setHeader("Cache-Control", `public, max-age=${ttl}, s-maxage=${ttl}`);
    }

    const data = await this.items.getItems(endpoint.id);
    if (!data || !("data" in data) || !data.data) {
      return res.status(500).json({ error: "Erro interno", statusCode: 500 });
    }

    data.data.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    if (t) {
      const searchTerm = Array.isArray(t) ? t[0] : t;
      if (!searchTerm) {
        return res.status(400).json({ error: "Parâmetro 't' é obrigatório", statusCode: 400 });
      }

      const searchResults = this.searchByTituloIdentificador(data, searchTerm);
      return res.status(searchResults.statusCode).json(searchResults);
    }

    return res.status(200).json({ data: data.data, statusCode: 200 });
  };

  private searchByTituloIdentificador(data: any, searchTerm: string) {
    if (!data || !data.data || data.data.length === 0) {
      return { error: "Nenhum dado encontrado", statusCode: 404 };
    }

    const normalizedSearchTerm = normalizeString(searchTerm);
    const results = data.data.filter((item: any) => {
      const itemTitle = normalizeString(item.formattedData.titulo_identificador);
      return itemTitle === normalizedSearchTerm;
    });

    if (results.length === 0) {
      return { error: "Nenhum resultado encontrado", statusCode: 404 };
    }

    return { data: results, statusCode: 200 };
  }

  private getRequestPassword(req: NextApiRequest) {
    const headerPassword = req.headers["x-endpoint-password"];
    if (Array.isArray(headerPassword)) return headerPassword[0] || "";
    return headerPassword || "";
  }
}

export const endpointController = new EndpointController(endpointService, itemService);
