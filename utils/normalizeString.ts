export const normalizeString = (str: string) => {
    return str
      .toLowerCase() // Converte para minúsculas
      .normalize("NFD") // Normaliza os caracteres Unicode
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .trim(); // Remove espaços extras
  };