import { typeFormat } from "./typesFormat";

export const formatDataToDynamicObject = (data: any) => {
    // Se `data` for um objeto único, convertemos para um array
    if (!Array.isArray(data)) {
        console.warn("Aviso: `data` não é um array. Convertendo para array.");
        data = [data]; // Transforma em um array
    }

    const fieldProperties: { [key: string]: { mult: boolean; type?: string } } = typeFormat

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
