# ValeFish Backend API

Backend Node.js + TypeScript para sistema de gestão de entrada e processamento de pescados.

## 🚀 Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Banco de Dados:** MongoDB com Mongoose
- **Autenticação:** JWT + bcrypt
- **CORS:** Habilitado

## 📋 Requisitos

- Node.js 18+
- MongoDB local ou remoto
- npm ou yarn

## 🔧 Instalação

```bash
cd backend
npm install
```

## ⚙️ Configuração

1. Copie `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Configure suas variáveis de ambiente:
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/valefish
JWT_SECRET=seu_secret_aqui
NODE_ENV=development
CORS_ORIGIN=http://localhost:8081
```

## 🏃 Executar

### Desenvolvimento
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Produção
```bash
npm start
```

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Status do servidor

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Dados do usuário atual (autenticado)

### Lotes
- `POST /api/lotes` - Criar lote (autenticado)
- `GET /api/lotes` - Listar lotes (autenticado)
- `GET /api/lotes/:id` - Obter lote (autenticado)
- `PUT /api/lotes/:id` - Atualizar lote (autenticado)
- `DELETE /api/lotes/:id` - Deletar lote (autenticado)

## 📝 Exemplo de Request

### Register
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "senha123",
    "name": "João Silva"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "senha123"
  }'
```

## 🔐 Autenticação

Todos os endpoints de lotes requerem um token JWT no header:
```
Authorization: Bearer {token_aqui}
```

## 📦 Deploy

### Railway
1. Conecte seu repositório GitHub ao Railway
2. Configure as variáveis de ambiente no painel
3. Deploy automático ao fazer push

## 📚 Estrutura

```
backend/
├── src/
│   ├── index.ts              # Arquivo principal
│   ├── models/               # Modelos MongoDB
│   │   ├── User.ts
│   │   └── Lote.ts
│   ├── routes/               # Rotas da API
│   │   ├── auth.ts
│   │   └── lotes.ts
│   ├── middleware/           # Middlewares
│   │   └── auth.ts
│   └── utils/                # Utilitários
│       └── auth.ts
├── .env.example              # Exemplo de variáveis
├── package.json
└── tsconfig.json
```
