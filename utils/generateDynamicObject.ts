import { typeFormat } from "./typesFormat";

export const generateDynamicObject = (fields: string[]) => {
    const fieldProperties: { [key: string]: { mult: boolean; type?: string } } = typeFormat

    return {
        id_endpoint: null,
        id: null,
        data: [
            {
                value: null,
                title: "titulo_identificador",
                type: fieldProperties["titulo_identificador"].type,
                mult: fieldProperties["titulo_identificador"].mult,
            },
            ...fields.map((field) => ({
                value: null,
                title: field,
                type: fieldProperties[field]?.type || null,
                mult: fieldProperties[field]?.mult || false,
            })),
        ],
    };
};

