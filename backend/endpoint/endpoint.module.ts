import { endpointController, EndpointController } from "@/backend/endpoint/endpoint.controller";
import { endpointRepository, EndpointRepository } from "@/backend/endpoint/endpoint.repository";
import { endpointService, EndpointService } from "@/backend/endpoint/endpoint.service";

export class EndpointModule {
  readonly controller: EndpointController;
  readonly service: EndpointService;
  readonly repository: EndpointRepository;

  constructor() {
    this.repository = endpointRepository;
    this.service = endpointService;
    this.controller = endpointController;
  }
}

export const endpointModule = new EndpointModule();
