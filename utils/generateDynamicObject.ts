export const generateDynamicObject = (fields: string[]) => {
    const fieldProperties: { [key: string]: { mult: boolean; type?: string } } = {
        titulo_identificador: { mult: false, type: "string" },
        titulo: { mult: false, type: "string" },
        link: { mult: false, type: "string" },
        preco: { mult: false, type: "string" },
        descricao: { mult: true, type: "string" },
        breve_descricao: { mult: true, type: "string" },
        artigo: { mult: true, type: "string" },
        image: { mult: false, type: "img" },
        nome: { mult: false, type: "string" },
        senha: { mult: false, type: "string" },
        texto: { mult: true, type: "string" },
    };

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

