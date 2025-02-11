import imageCompression from "browser-image-compression";

/**
 * Comprime e converte uma imagem para Base64 otimizada
 * @param file Arquivo de imagem original
 * @returns Base64 da imagem otimizada
 */
export const optimizeImage = async (file: File): Promise<string> => {
  if (!file) throw new Error("Arquivo inválido");

  const options = {
    maxSizeMB: 0.2, // Reduz para ~200KB
    maxWidthOrHeight: 800, // Limite de tamanho da imagem
    useWebWorker: true, // Usa WebWorker para melhor performance
    fileType: "image/webp", // Converte para WebP para melhor compressão
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return await convertToBase64(compressedFile);
  } catch (error) {
    console.error("Erro ao otimizar a imagem:", error);
    throw new Error("Falha na otimização da imagem");
  }
};

/**
 * Converte um arquivo em Base64
 * @param file Arquivo de imagem
 * @returns Base64 da imagem
 */
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
