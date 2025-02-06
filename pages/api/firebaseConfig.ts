import { NextApiRequest, NextApiResponse } from "next";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { createSecretKey } from 'crypto';



// 🔹 Caminho onde o arquivo TypeScript será salvo
const configPath = path.join(process.cwd(), "config/config.ts");

// 🔹 Função para testar conexão com Firestore
const testFirestoreConnection = async (configData: any) => {
  try {
    // console.log("🔍 Testando conexão com Firestore...");
    const firebaseApp = initializeApp(configData);
    const db = getFirestore(firebaseApp);
    // console.log("📦 Firestore Database:", db);
    return db ? { success: true, message: "✅ Conexão com Firestore bem-sucedida!" } 
              : { success: false, message: "❌ Falha ao conectar com Firestore." };
  } catch (error) {
    console.error("⚠️ Erro ao conectar com Firestore:", error);
    return { success: false, message: "❌ Erro na conexão com Firestore." };
  }
};

// 🔹 API para validar e salvar credenciais Firebase no formato TypeScript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const _SECRET_KEY_ = 'lA0qUhYC0MnzpZ8abcdefghij12345678901234567890';

  if (req.method !== "POST") {
    return res.status(405).json({ message: "🚫 Método não permitido" });
  }

  // 🔒 Verifica autenticação da requisição
  if (req.headers["authorization"] !== `Bearer ${_SECRET_KEY_}`) {
    return res.status(403).json({ message: "❌ Acesso negado" });
  }

  const { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId } = req.body;

  // 📌 Validação dos campos obrigatórios
  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    return res.status(400).json({ message: "❌ Todos os campos são obrigatórios" });
  }

  const firebaseConfig = { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };

  // 🔹 Testa a conexão antes de salvar
  const testResult = await testFirestoreConnection(firebaseConfig);
  if (!testResult.success) {
    return res.status(500).json({ message: testResult.message });
  }

  // 🔹 Converte para TypeScript
  const tsConfig = `// 🔹 firebaseConfig.ts
export const IsStartedfirebaseConfig = true;
export const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};
`;

  // 🔹 Salva o arquivo `config.ts`
  try {
    fs.writeFileSync(configPath, tsConfig, "utf8");
    // console.log("✅ Configuração salva com sucesso em TypeScript!");
    return res.status(200).json({ message: "✅ Configuração salva e conexão testada com sucesso!" });
  } catch (error) {
    console.error("⚠️ Erro ao salvar configuração:", error);
    return res.status(500).json({ message: "❌ Erro ao salvar as configurações do Firebase" });
  }
}
