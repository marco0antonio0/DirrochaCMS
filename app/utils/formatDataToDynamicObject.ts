import { typeFormat } from "./typesFormat";

const buildSchemaMap = (schema: any[] = []) => {
    return schema.reduce((acc, field) => {
        if (typeof field === "string") {
            acc[field] = typeFormat[field] || { mult: false, type: "string" };
            return acc;
        }

        const title = field?.name || field?.key || field?.title;
        if (title) {
            acc[title] = {
                mult: field.mult ?? typeFormat[title]?.mult ?? false,
                type: field.type || typeFormat[title]?.type || "string",
            };
        }

        return acc;
    }, {} as Record<string, { mult: boolean; type?: string }>);
};

export const formatDataToDynamicObject = (data: any, schema: any[] = []) => {
    // Se `data` for um objeto único, convertemos para um array
    if (!Array.isArray(data)) {
        console.warn("Aviso: `data` não é um array. Convertendo para array.");
        data = [data]; // Transforma em um array
    }

    const fieldProperties: { [key: string]: { mult: boolean; type?: string } } = {
        ...typeFormat,
        ...buildSchemaMap(schema),
    };

    return data.map((item:any) => ({
        id_endpoint: item.endpointId || null,
        id: item.id || null,
        data: [
            {
                value: item.formattedData?.titulo_identificador || null,
                title: "titulo_identificador",
                type: fieldProperties["titulo_identificador"].type,
                mult: fieldProperties["titulo_identificador"].mult,
            },
            ...Object.entries(item.formattedData || {})
                .filter(([key]) => key !== "titulo_identificador") // Evita duplicação
                .map(([key, value]) => ({
                    value,
                    title: key,
                    type: fieldProperties[key]?.type || "string",
                    mult: fieldProperties[key]?.mult || false,
                })),
        ],
    }));
};

export default formatDataToDynamicObject;
