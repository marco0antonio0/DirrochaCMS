import { describe, expect, it } from "vitest";
import { validateItemFields, ItemValidationError } from "@/backend/item/itemValidation";
import type { EndpointField } from "@/backend/endpoint/endpoint.model";

const schema: EndpointField[] = [
  { name: "titulo", type: "string" },
  { name: "preco", type: "number" },
  { name: "imagem", type: "img" },
];

describe("validateItemFields", () => {
  it("returns only fields declared in the endpoint schema", () => {
    const result = validateItemFields(
      [
        { title: "titulo", value: "Produto" },
        { title: "preco", value: "19,90" },
        { title: "titulo_identificador", value: "produto" },
      ],
      schema,
    );

    expect(result).toEqual([
      { title: "titulo", value: "Produto" },
      { title: "preco", value: "19,90" },
      { title: "titulo_identificador", value: "produto" },
    ]);
  });

  it("rejects fields that are not declared in the schema", () => {
    expect(() =>
      validateItemFields([{ title: "admin", value: "true" }], schema),
    ).toThrow(/nao existe/);
  });

  it("rejects prototype pollution keys even if they are submitted", () => {
    expect(() =>
      validateItemFields([{ title: "__proto__", value: "x" }], ["__proto__"]),
    ).toThrow(ItemValidationError);
  });

  it("rejects invalid numeric and image values", () => {
    expect(() =>
      validateItemFields([{ title: "preco", value: "dezenove" }], schema),
    ).toThrow(/numerico/);

    expect(() =>
      validateItemFields([{ title: "imagem", value: "data:text/html;base64,PHNjcmlwdA==" }], schema),
    ).toThrow(/tipo de imagem nao permitido/);
  });
});
