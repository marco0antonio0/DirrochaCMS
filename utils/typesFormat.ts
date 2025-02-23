/**
 * 📖 Documentação: Como Criar um Novo Campo
 *
 * Para adicionar um novo campo à `optionsData`, siga o formato abaixo:
 *
 * {
 *   key: "nome_do_campo",  // Nome único do campo (sem espaços)
 *   title: "Nome Amigável", // Nome amigável para exibição ao usuário
 *   desc: "Breve descrição do campo", // Explicação sobre o campo
 *   mult: false, // Se o campo aceita múltiplas linhas (true = sim, false = não)
 *   type: "string", // Tipo do campo: "string", "date" ou "img"
 * }
 *
 * 🔹 O campo será automaticamente convertido para `typeFormat` sem necessidade de alteração manual.
 * 🔹 O campo `titulo_identificador` é adicionado automaticamente ao `typeFormat`.
 */

export const optionsData = [
    { key: "titulo", title: "Titulo", desc: "Campo de texto simples", mult: false, type: "string" },
    { key: "data", title: "Data", desc: "Campo de data dd-mm-yyyy", mult: false, type: "date" },
    { key: "descricao", title: "Descrição", desc: "Campo de texto multi linha", mult: true, type: "string" },
    { key: "breve_descricao", title: "Breve Descrição", desc: "Campo de texto multi linha", mult: true, type: "string" },
    { key: "artigo", title: "Artigo", desc: "Campo de texto multi linha", mult: true, type: "string" },
    { key: "image", title: "Imagem", desc: "Campo de imagem", mult: false, type: "img" },
    { key: "nome", title: "Nome", desc: "Campo de texto simples", mult: false, type: "string" },
    { key: "senha", title: "Senha", desc: "Campo de texto simples", mult: false, type: "string" },
    { key: "texto", title: "Texto", desc: "Campo de texto multi linha", mult: true, type: "string" },
    { key: "link", title: "Link", desc: "Campo de texto simples", mult: false, type: "string" },
    { key: "preco", title: "Preço", desc: "Campo de texto simples", mult: false, type: "string" },
  
    // 🔹 Exemplo de novo campo:
    // { key: "telefone", title: "Telefone", desc: "Campo para número de telefone", mult: false, type: "string" },
  ];
  
  /**
   * 🛠️ Função para converter `optionsData` em `typeFormat`
   * - Gera automaticamente os campos no formato correto
   * - Adiciona o campo `titulo_identificador` automaticamente
   */
  export const generateTypeFormat = () => {
    const typeFormat = optionsData.reduce((acc, { key, mult, type }) => {
      acc[key] = { mult, type };
      return acc;
    }, {} as Record<string, { mult: boolean; type: string }>);
  
    // 🔹 Adicionando `titulo_identificador` automaticamente
    typeFormat["titulo_identificador"] = { mult: false, type: "string" };
  
    return typeFormat;
  };
  
  // 📤 Exportando `typeFormat` gerado dinamicamente
  export const typeFormat = generateTypeFormat();
  