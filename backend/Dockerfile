FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código
COPY . .

# Build TypeScript
RUN npm run build

# Expor porta
EXPOSE 4000

# Iniciar servidor
CMD ["npm", "start"]
