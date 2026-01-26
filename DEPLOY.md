# Guia de Deploy - ValeFish na VPS com Docker

## 📋 Pré-requisitos

- VPS com Linux (Ubuntu 20.04+)
- Docker instalado
- Docker Compose instalado
- MongoDB Atlas (conta grátis)
- Git configurado

## 🔧 Instalação de Docker (se não tiver)

### Ubuntu/Debian
```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar seu usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

## 🗄️ Configurar MongoDB Atlas

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie uma conta grátis
3. Crie um cluster (M0 = grátis)
4. Na seção "Database Access", crie um usuário:
   - Username: `valefish`
   - Password: `sua_senha_segura`
5. Na seção "Network Access", adicione `0.0.0.0/0` (ou seu IP da VPS)
6. Copie a connection string:
   ```
   mongodb+srv://valefish:sua_senha@cluster.mongodb.net/valefish?retryWrites=true&w=majority
   ```

## 📤 Deploy na VPS

### 1. Clonar repositório
```bash
cd ~
git clone https://github.com/ValeMilk/ValeFish.git
cd ValeFish
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.production .env
nano .env
```

Configure as variáveis:
```env
MONGODB_URI=mongodb+srv://valefish:sua_senha@cluster.mongodb.net/valefish?retryWrites=true&w=majority
JWT_SECRET=sua_chave_jwt_bem_segura_aqui
CORS_ORIGIN=https://seu-dominio.com
VITE_API_URL=https://api.seu-dominio.com/api
```

### 3. Executar deploy
```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. Verificar status
```bash
docker-compose ps

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🌐 Configurar Nginx como Reverse Proxy (Opcional)

Se quiser usar seu domínio com HTTPS:

```bash
sudo apt install nginx certbot python3-certbot-nginx -y

# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/valefish
```

Adicione:
```nginx
server {
    server_name seu-dominio.com api.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    server_name api.seu-dominio.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Habilitar e obter certificado SSL:
```bash
sudo ln -s /etc/nginx/sites-available/valefish /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d seu-dominio.com -d api.seu-dominio.com
```

## 📊 Estrutura no Servidor

```
/home/usuario/ValeFish/
├── backend/          # Node.js + Express
├── frontend/         # React + Vite (será buildado no Docker)
├── docker-compose.yml
├── .env              # Variáveis de produção
└── deploy.sh         # Script de deploy
```

## 🔄 Atualizar Aplicação

```bash
cd ~/ValeFish
git pull origin main
./deploy.sh
```

## 🐛 Troubleshooting

### Containers não iniciam
```bash
docker-compose logs backend
docker-compose logs frontend
```

### MongoDB connection error
- Verifique a connection string em `.env`
- Verifique se IP da VPS está em Network Access no MongoDB Atlas
- Teste a conexão: `mongosh "sua_connection_string"`

### Porta já em uso
```bash
# Mude no docker-compose.yml:
# ports:
#   - "8000:4000"  (backend em 8000)
#   - "8080:3000"  (frontend em 8080)
```

### Ver status em tempo real
```bash
watch docker-compose ps
```

## 📈 Monitoramento

### CPU e Memória
```bash
docker stats
```

### Logs das últimas 100 linhas
```bash
docker-compose logs --tail=100 backend
```

## ✅ Verificação Final

- Frontend: `https://seu-dominio.com`
- Backend API: `https://api.seu-dominio.com/api/health`

Deve retornar:
```json
{
  "status": "OK",
  "message": "ValeFish Backend is running",
  "timestamp": "2026-01-26T..."
}
```

---

**Dúvidas?** Verifique os logs com `docker-compose logs`!
