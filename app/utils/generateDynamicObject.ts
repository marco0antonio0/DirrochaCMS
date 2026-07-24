import { typeFormat } from "./typesFormat";

type DynamicField = string | {
    name?: string;
    key?: string;
    title?: string;
    type?: string;
    mult?: boolean;
};

const normalizeField = (field: DynamicField) => {
    if (typeof field === "string") {
        const fieldProperties = typeFormat[field];
        return {
            title: field,
            type: fieldProperties?.type || "string",
            mult: fieldProperties?.mult || false,
        };
    }

    const title = field.name || field.key || field.title || "";
    const fallback = typeFormat[title];

    return {
        title,
        type: field.type || fallback?.type || "string",
        mult: field.mult ?? fallback?.mult ?? false,
    };
};

export const generateDynamicObject = (fields: DynamicField[]) => {
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
                title: normalizeField(field).title,
                type: normalizeField(field).type,
                mult: normalizeField(field).mult,
            })),
        ],
    };
};
