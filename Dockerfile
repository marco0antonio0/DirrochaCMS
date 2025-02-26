# Usa a imagem oficial do Node.js
FROM node:18-alpine AS builder

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência
COPY package.json package-lock.json ./ 

# Instala as dependências
RUN npm install

# Copia os arquivos do projeto para dentro do container
COPY . .

# Constrói a aplicação Next.js
RUN npm run build

# Segunda etapa para um container mais leve
FROM node:18-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos construídos da primeira etapa
COPY --from=builder /app .

# Expõe a porta utilizada pelo Next.js
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]
