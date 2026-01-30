# ValeFish - Sistema de Gestão de Lotes

Sistema completo para gerenciamento de produção de filé de peixe, desenvolvido para a ValeFish.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Uso do Sistema](#uso-do-sistema)
- [Estrutura de Dados](#estrutura-de-dados)
- [API Endpoints](#api-endpoints)
- [Deploy](#deploy)
- [Fluxos de Trabalho](#fluxos-de-trabalho)

## 🎯 Visão Geral

O ValeFish é um sistema web para controle de produção de filé de peixe que permite:
- Registro de entrada de matéria-prima
- Controle de filetagem e congelamento
- Gestão de embalagem (400g e 800g)
- Cálculo automático de aproveitamento
- Geração de relatórios em PDF
- Dashboard com métricas e gráficos

### Usuários do Sistema
- **Operador**: Registra lotes, edita e visualiza dados de produção
- **Administrador**: Acesso total + painel administrativo com estatísticas

## ✨ Funcionalidades

### 1. Gestão de Lotes

#### 1.1 Registro de Entrada
- **Informações do Lote**: Data, processo, fornecedor (VALEFISH, NORFISH, CARLITO), número do lote
- **Nota Fiscal**: Número, valor, peso por tamanho (P, M, G, GG), número de basquetas
- **Peso Salão**: Pesagem real no salão por tamanho
- **Gap**: Cálculo automático da diferença (Salão - NF)

#### 1.2 Filetagem
- **Filé In Natura**: Peso antes do congelamento (P, M, G, GG)
- **Filé Congelado**: Peso após congelamento (P, M, G, GG)
- **Diferença**: Congelado - In Natura (mostra crescimento/redução)
- **Rendimento**: ((Congelado / In Natura) - 1) × 100 (percentual de crescimento real)

#### 1.3 Tipo de Filé
- **400g**: 24 pacotes por caixa
- **800g**: 12 pacotes por caixa

#### 1.4 Embalagem
- **Caixas**: Quantidade de caixas master
- **Pacotes**: Quantidade de pacotes avulsos
- **Cálculos Automáticos**:
  - Filé Embalado Total: (Caixas × Pacotes/Caixa × Gramatura + Pacotes × Gramatura) / 1000
  - Pacotes Total: Caixas × (24 ou 12) + Pacotes
  - Caixas Total: Pacotes ÷ (24 ou 12) + Caixas
- **Datas**: Fabricação e validade (auto +364 dias)
- **Aproveitamentos**:
  - NF: (Filé Embalado / Peso NF) × 100
  - Salão: (Filé Embalado / Peso Salão) × 100

#### 1.5 Status dos Lotes
- **Aberto**: Lote em andamento, pode ser editado e finalizado posteriormente
- **Finalizado**: Lote completo, pode ser editado com senha

### 2. Dashboard do Operador

#### 2.1 Filtros
- **Período**: Data inicial e final
- **Busca por NF**: Pesquisa rápida por número de nota fiscal

#### 2.2 Métricas (Cards)
- Total de Lotes
- Kg Processados
- Faturamento Total (R$)
- Lotes Abertos

#### 2.3 Gráficos
- **Linha Temporal**: Kg produzidos por dia (últimos 7 dias)
- **Linha Temporal**: Faturamento por dia (últimos 7 dias)

#### 2.4 Lista de Lotes
Tabela com:
- Data de produção
- Processo
- Número do lote
- NF
- Fornecedor
- Status (badge verde/amarelo)
- Ações:
  - 👁️ **Ver**: Modal com layout de impressão
  - ✏️ **Editar**: Redireciona para tela de registro
  - 🖨️ **Imprimir**: Gera PDF formatado

### 3. Painel Administrativo

Acesso exclusivo para administradores com:

#### 3.1 Estatísticas Gerais
- Total de lotes processados
- Kg total processado
- Faturamento total
- Média de aproveitamento

#### 3.2 Estatísticas por Fornecedor
- Lotes por fornecedor
- Kg processados por fornecedor
- Faturamento por fornecedor
- Aproveitamento médio por fornecedor

#### 3.3 Estatísticas por Tamanho
- Distribuição de peso por tamanho (P, M, G, GG)
- Porcentagem de cada tamanho no total

#### 3.4 Relatório por Data
- Filtro de período personalizado
- Lotes criados no período
- Métricas do período selecionado

### 4. Sistema de Edição

#### 4.1 Editar Lote Aberto
1. Clicar em "Editar" → Carrega na tela de entrada
2. Modificar dados → Recalcula automaticamente
3. Clicar "Finalizar" ou "Salvar Aberto"
4. Salva sem pedir senha

#### 4.2 Editar Lote Finalizado
1. Clicar em "Editar" → Carrega na tela de entrada
2. Modificar dados → Recalcula automaticamente
3. Clicar "Finalizar" → Abre diálogo de senha
4. Confirmar senha → Salva alterações
5. **Todos os cálculos são refeitos** (embalagem, aproveitamentos)
6. **Impressão mostra valores atualizados**

### 5. Impressão de Lotes

Layout profissional em A4 com:

#### 5.1 Cabeçalho
- Logo ValeFish (65px altura)
- Título "ValeFish Relatório de Lote"
- Data de impressão

#### 5.2 Informações do Lote (Grid 3 colunas)
1. Data de Produção
2. Processo
3. Fornecedor
4. Nota Fiscal
5. **Número do Lote** (destaque azul)
6. **Valor da Transferência** (destaque amarelo)

#### 5.3 Nota Fiscal e Peso
- Cards resumo: Total NF, Total Salão, Gap
- Tabela detalhada por tamanho (P, M, G, GG)

#### 5.4 Filetagem
- Cards resumo: In Natura, Congelado, Diferença, Rendimento
- Tabela detalhada por tamanho

#### 5.5 Embalagem (apenas lotes finalizados)
- Tipo de Filé (400g ou 800g)
- Pacotes Total (com cálculo explicado)
- Caixas Total (com cálculo explicado)
- Filé Embalado Total
- Aproveitamento NF e Salão
- Datas fabricação/validade

#### 5.6 Rodapé
- Timestamp de geração

## 🛠️ Tecnologias

### Frontend
- **React 18** com TypeScript
- **Vite 5.4.19** (build tool)
- **TailwindCSS** + **shadcn/ui** (UI components)
- **Recharts** (gráficos)
- **react-to-print 3.0.2** (geração de PDF)
- **React Router** (navegação com proteção de rotas)

### Backend
- **Node.js 18** + **Express** + TypeScript
- **MongoDB Atlas** com Mongoose
- **JWT** (autenticação com roles)
- **bcryptjs** (hash de senhas)
- **CORS** configurado para produção

### Infraestrutura
- **VPS**: Ubuntu 24.04 (IP: 72.61.62.17)
- **Docker Compose** (orquestração)
- **Nginx** (frontend na porta 8888)
- **Node** (backend na porta 4000)

## 🏗️ Arquitetura

```
ValeFish/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx          # Dashboard operador
│   │   │   ├── AdminDashboard.tsx     # Painel admin
│   │   │   ├── RegistroEntrada.tsx    # Formulário de lotes
│   │   │   ├── PrintableLote.tsx      # Layout de impressão
│   │   │   ├── Header.tsx             # Navegação
│   │   │   ├── FormSection.tsx        # Accordion sections
│   │   │   ├── FormInput.tsx          # Input genérico
│   │   │   ├── SizeWeightInput.tsx    # Input P/M/G/GG
│   │   │   └── LoteModal.tsx          # Modal de edição (legacy)
│   │   ├── pages/
│   │   │   ├── Index.tsx              # Página principal
│   │   │   ├── Login.tsx              # Tela de login
│   │   │   └── Admin.tsx              # Área administrativa
│   │   ├── types/
│   │   │   └── lote.ts                # Interfaces TypeScript
│   │   └── hooks/
│   │       └── use-toast.ts           # Sistema de notificações
│   ├── Dockerfile
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.ts                # Schema de usuários
│   │   │   └── Lote.ts                # Schema de lotes
│   │   ├── routes/
│   │   │   ├── auth.ts                # Rotas de autenticação
│   │   │   ├── lotes.ts               # CRUD de lotes
│   │   │   ├── analytics.ts           # Estatísticas
│   │   │   └── admin.ts               # Rotas admin
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts      # Verificação JWT
│   │   └── index.ts                   # Express app
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .env                                # Variáveis de ambiente
└── README.md                           # Esta documentação
```

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- MongoDB (Atlas ou local)
- Docker + Docker Compose (para deploy)

### Desenvolvimento Local

1. **Clone o repositório**
```bash
git clone https://github.com/ValeMilk/ValeFish.git
cd ValeFish
```

2. **Configure variáveis de ambiente**

Crie `.env` na raiz:
```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/valefish
JWT_SECRET=seu_jwt_secret_aqui
CORS_ORIGIN=http://localhost:8081
VITE_API_URL=http://localhost:4000/api
```

3. **Backend**
```bash
cd backend
npm install
npm run dev  # Roda na porta 4000
```

4. **Frontend**
```bash
cd frontend
npm install
npm run dev  # Roda na porta 8081
```

5. **Criar usuário admin** (via MongoDB Compass ou mongosh)
```javascript
db.users.insertOne({
  username: "admin",
  password: "$2a$10$hashGeradoPeloBcrypt",  // Use bcrypt para gerar
  role: "admin"
})
```

## 🚀 Deploy

### Deploy no VPS (Produção)

1. **Conectar ao VPS**
```bash
ssh root@72.61.62.17
```

2. **Navegar para o diretório**
```bash
cd /opt/ValeFish
```

3. **Atualizar código**
```bash
git pull origin main
```

4. **Rebuild e restart**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

5. **Verificar logs**
```bash
docker logs valefish-frontend --tail 50
docker logs valefish-backend --tail 50
```

### URLs de Produção
- **Frontend**: http://72.61.62.17:8888
- **Backend API**: http://72.61.62.17:4000/api

## 📖 Uso do Sistema

### Login
- **Operador**: Acesso ao dashboard e registro de lotes
- **Admin**: Acesso total incluindo painel administrativo

### Fluxo Básico - Criar Lote

1. **Login** → Selecionar "Entrada de Lote"
2. **Informações do Lote**: Preencher data, processo, fornecedor, número do lote
3. **Nota Fiscal e Peso**:
   - Número da NF e valor
   - Peso NF por tamanho
   - Peso Salão por tamanho
   - Número de basquetas
   - Clicar "Confirmar Nota Fiscal e Peso"
4. **Filetagem**:
   - Filé In Natura por tamanho
   - Filé Congelado por tamanho
   - Clicar "Confirmar Filetagem"
5. **Tipo de Filé**: Selecionar 400g ou 800g
6. **Embalagem**:
   - Quantidade de caixas
   - Quantidade de pacotes
   - Data de fabricação (validade calcula automaticamente)
   - Clicar "Confirmar Embalagem"
7. **Salvar**:
   - "Salvar Aberto" (para continuar depois)
   - "Finalizar" (lote completo)

### Fluxo - Editar Lote

#### Lote Aberto:
1. Dashboard → Clicar ✏️ "Editar"
2. Modifica dados → Recalcula automaticamente
3. "Finalizar" ou "Salvar Aberto" → Salva direto

#### Lote Finalizado:
1. Dashboard → Clicar ✏️ "Editar"
2. Modifica dados → Recalcula automaticamente
3. "Finalizar" → **Aparece diálogo de senha**
4. Digite senha → "Confirmar"
5. Salva com valores recalculados

### Fluxo - Visualizar/Imprimir

1. Dashboard → Clicar 👁️ "Ver"
   - Abre modal com layout bonito de impressão
   - Botão "Fechar" para sair

2. Dashboard → Clicar 🖨️ "Imprimir"
   - Abre diálogo de impressão do navegador
   - Salvar como PDF ou imprimir direto

## 📊 Estrutura de Dados

### Lote (Interface TypeScript)

```typescript
interface LoteData {
  id?: string;
  _id?: string;
  
  // Informações básicas
  dataProducao: string;              // "YYYY-MM-DD"
  processo: string;                  // Número do processo
  fornecedor: string;                // "VALEFISH" | "NORFISH" | "CARLITO"
  numeroLote: string;                // "25-63"
  numeroNF?: string;                 // "3555/3563"
  valorNF?: number;                  // 21799.32
  
  // Pesos (objetos com P, M, G, GG)
  pesoNotaFiscal: FishWeight;        // { P: 659.15, M: 1799.05, G: 0, GG: 0 }
  pesoSalao: FishWeight;             // { P: 673.4, M: 1815.05, G: 0, GG: 0 }
  numBasquetas: FishWeight;          // { P: 34, M: 90, G: 0, GG: 0 }
  
  // Filetagem
  fileInNatura: FishWeight;          // { P: 226.1, M: 645.3, G: 0, GG: 0 }
  fileCongelado: FishWeight;         // { P: 226.2, M: 646.85, G: 0, GG: 0 }
  
  // Embalagem
  tipoFile?: '400g' | '800g';        // Tipo de filé
  qtdMaster?: number;                // 92 caixas (campo legado)
  qtdSacos?: number;                 // 10 pacotes (campo legado)
  caixas?: number;                   // 92 (novo)
  pacotes?: number;                  // 10 (novo)
  fileEmbalado: FishWeight;          // { P: 887.2, M: 0, G: 0, GG: 0 }
  dataFabricacao?: string;           // "2025-12-16"
  dataValidade?: string;             // "2026-12-15"
  
  // Aproveitamentos (calculados)
  aprovNotaFiscal?: number;          // 36.09
  aprovSalao?: number;               // 35.65
  
  // Status
  status: 'aberto' | 'finalizado';
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

interface FishWeight {
  P: number;   // Pequeno
  M: number;   // Médio
  G: number;   // Grande
  GG: number;  // Extra Grande
}
```

### Usuário (Schema MongoDB)

```javascript
{
  username: String,       // Login único
  password: String,       // Hash bcrypt
  role: String,          // "admin" | "operador"
  createdAt: Date
}
```

## 🔌 API Endpoints

### Autenticação (`/api/auth`)

#### POST `/api/auth/login`
Login do usuário

**Request:**
```json
{
  "username": "admin",
  "password": "senha123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin",
  "role": "admin"
}
```

#### POST `/api/auth/register`
Criar novo usuário (requer admin)

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "username": "operador1",
  "password": "senha456",
  "role": "operador"
}
```

### Lotes (`/api/lotes`)

Todos os endpoints requerem autenticação: `Authorization: Bearer <token>`

#### GET `/api/lotes`
Listar todos os lotes

**Response:**
```json
[
  {
    "id": "697cc166bc134155a6c90ded",
    "numeroLote": "25-63",
    "dataProducao": "2025-12-15",
    "status": "finalizado",
    ...
  }
]
```

#### GET `/api/lotes/:id`
Buscar lote específico

#### POST `/api/lotes`
Criar novo lote

**Request:** Objeto LoteData completo

#### PUT `/api/lotes/:id`
Atualizar lote existente

**Request:**
```json
{
  ...loteData,
  "password": "senha123"  // Obrigatório para lotes finalizados
}
```

#### DELETE `/api/lotes/:id`
Deletar lote (requer senha)

**Request:**
```json
{
  "password": "senha123"
}
```

### Analytics (`/api/analytics`)

#### GET `/api/analytics/stats/geral`
Estatísticas gerais

**Query params:** `?startDate=2025-01-01&endDate=2025-12-31`

**Response:**
```json
{
  "totalLotes": 150,
  "totalKg": 45678.90,
  "totalFaturamento": 987654.32,
  "mediaAproveitamento": 36.5
}
```

#### GET `/api/analytics/stats/fornecedor`
Estatísticas por fornecedor

#### GET `/api/analytics/stats/tamanho`
Distribuição por tamanho de peixe

### Admin (`/api/admin`)

Requer role "admin"

#### GET `/api/admin/users`
Listar todos os usuários

#### POST `/api/admin/users`
Criar usuário

#### PUT `/api/admin/users/:id`
Atualizar usuário

#### DELETE `/api/admin/users/:id`
Deletar usuário

## 🔄 Fluxos de Trabalho

### Fluxo de Cálculos Automáticos

#### 1. Gap
```
Gap = Peso Salão Total - Peso NF Total
```

#### 2. Filetagem - Rendimento
```
Rendimento = ((Congelado Total / In Natura Total) - 1) × 100
```
Exemplo: (873.05 / 871.40 - 1) × 100 = 0.19% (crescimento real)

#### 3. Embalagem - Filé Embalado Total
```
Kg Master = (Caixas × Gramatura × 24) / 1000
Kg Sacos = (Pacotes × Gramatura) / 1000
Filé Embalado = Kg Master + Kg Sacos
```

Exemplo 400g:
- 92 caixas: (92 × 400 × 24) / 1000 = 883.20 kg
- 10 pacotes: (10 × 400) / 1000 = 4.00 kg
- Total: 887.20 kg

#### 4. Aproveitamento NF
```
Aproveitamento NF = (Filé Embalado Total / Peso NF Total) × 100
```

#### 5. Aproveitamento Salão
```
Aproveitamento Salão = (Filé Embalado Total / Peso Salão Total) × 100
```

#### 6. Data Validade
```
Data Validade = Data Fabricação + 364 dias
```

### Fluxo de Estados (useEffect)

1. **Data Fabricação muda** → Recalcula Data Validade
2. **File In Natura ou Congelado muda** → Recalcula Filé Embalado
3. **Filé Embalado, Peso NF ou Salão muda** → Recalcula Aproveitamentos
4. **Caixas ou Pacotes muda** → Salva em ambos campos (novo e legado)
5. **Tipo de Filé selecionado** → Salva imediatamente

## 🔐 Segurança

### Autenticação
- JWT tokens com expiração
- Senhas hasheadas com bcrypt (10 rounds)
- Middleware verifica token em rotas protegidas

### Autorização
- Roles: "admin" e "operador"
- Admin routes verificam role no token
- Edição de lotes finalizados requer senha

### Validações
- Backend valida todos os campos obrigatórios
- Frontend valida antes de enviar
- CORS configurado para produção

## 📝 Notas Importantes

### Campos Legados
- `qtdMaster` e `qtdSacos` mantidos por compatibilidade
- Novos lotes usam `caixas` e `pacotes`
- PrintableLote usa fallback: `lote.caixas || lote.qtdMaster || 0`

### Recalculo em Edição
- `executeSave()` no Index.tsx recalcula TUDO antes de salvar
- Garante que impressão sempre mostra valores atualizados
- useEffects no RegistroEntrada recalculam em tempo real

### Performance
- useMemo para dados de gráficos
- Debounce não necessário (poucos lotes)
- MongoDB Atlas com indexes automáticos

## 🐛 Troubleshooting

### Problema: Botão fica "Salvando..." infinito
**Solução**: `finally` deve resetar ambos loadingStates

### Problema: Aproveitamento mostrando 100% em vez de 0%
**Solução**: Fórmula correta é `((congelado / inNatura) - 1) × 100`

### Problema: TipoFile não salva
**Solução**: Button onClick deve chamar `onChange('tipoFile', value)`

### Problema: Edição não atualiza valores
**Solução**: `executeSave` deve usar caixas/pacotes, não filetagem

### Problema: CORS error
**Solução**: Verificar CORS_ORIGIN no .env e rebuild containers

## 🎓 Créditos

**Desenvolvido para**: ValeFish  
**Desenvolvido por**: [Seu Nome]  
**Data**: Janeiro 2026  
**Versão**: 1.0.0  
**Repositório**: https://github.com/ValeMilk/ValeFish

---

**Suporte**: Para dúvidas ou problemas, contate o administrador do sistema.
