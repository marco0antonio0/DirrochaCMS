import { sessaoService, SessaoService } from "@/backend/sessao/sessao.service";

export class SessaoController {
  constructor(private readonly service: SessaoService) {}

  createSessao = this.service.createSessao.bind(this.service);
  updateSessao = this.service.updateSessao.bind(this.service);
  deleteSessao = this.service.deleteSessao.bind(this.service);
  validateToken = this.service.validateToken.bind(this.service);
}

export const sessaoController = new SessaoController(sessaoService);
