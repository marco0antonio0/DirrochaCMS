import { sessaoController, SessaoController } from "@/backend/sessao/sessao.controller";
import { sessaoRepository, SessaoRepository } from "@/backend/sessao/sessao.repository";
import { sessaoService, SessaoService } from "@/backend/sessao/sessao.service";

export class SessaoModule {
  readonly controller: SessaoController;
  readonly service: SessaoService;
  readonly repository: SessaoRepository;

  constructor() {
    this.repository = sessaoRepository;
    this.service = sessaoService;
    this.controller = sessaoController;
  }
}

export const sessaoModule = new SessaoModule();
