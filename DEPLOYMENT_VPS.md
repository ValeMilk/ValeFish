# 🚀 Guia Completo de Deployment - ValeFish na VPS

## 📋 Pré-requisitos

- VPS com Ubuntu 24.04 (IP: 72.61.62.17)
- Acesso SSH à VPS
- Git instalado na VPS
- Docker e Docker Compose instalados
- Domínio (opcional, pode usar IP direto)

---

## 1️⃣ Conectar à VPS via SSH

```bash
ssh root@72.61.62.17
```

Se tiver uma chave SSH específica:
```bash
ssh -i caminho/para/chave root@72.61.62.17
```

---

## 2️⃣ Instalar Docker e Docker Compose

Após conectar à VPS, execute:

```bash
# Atualizar pacotes
apt update && apt upgrade -y

# Instalar Docker
apt install -y docker.io

# Iniciar Docker
systemctl start docker
systemctl enable docker

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

---

## 3️⃣ Clonar o Repositório

```bash
# Clonar o repositório
cd /opt
git clone https://github.com/ValeMilk/ValeFish.git
cd ValeFish

# Verificar branch
git status
```

---

## 4️⃣ Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env com as variáveis de produção
nano .env
```

Adicione as seguintes variáveis (adapte conforme necessário):

```env
# MongoDB Atlas (MANTER COMO ESTÁ)
MONGODB_URI=mongodb+srv://nicolasimoes_db_user:lLIONFp9tQLr4aFw@lotebase.ubbjkoq.mongodb.net/valefish?retryWrites=true&w=majority

# Backend
PORT=4000
NODE_ENV=production
JWT_SECRET=sua_chave_jwt_muito_segura_aqui_minimo_32_caracteres
CORS_ORIGIN=http://72.61.62.17:3000

# Frontend
VITE_API_URL=http://72.61.62.17:4000/api
```

**Dicas de Segurança:**
- Gere um JWT_SECRET seguro: `openssl rand -base64 32`
- Se usar domínio: `CORS_ORIGIN=https://seu-dominio.com`
- Se usar domínio: `VITE_API_URL=https://api.seu-dominio.com/api`

---

## 5️⃣ Construir e Iniciar os Containers

```bash
# Navegar para o diretório do projeto
cd /opt/ValeFish

# Construir as imagens Docker
docker-compose build

# Iniciar os containers
docker-compose up -d

# Verificar se está tudo rodando
docker-compose ps

# Ver logs (opcional)
docker-compose logs -f
```

---

## 6️⃣ Acessar a Aplicação

### Com IP direto:
- **Frontend:** `http://72.61.62.17:3000`
- **Backend:** `http://72.61.62.17:4000/api/health`

### Testar a API:
```bash
curl http://72.61.62.17:4000/api/health
```

Resposta esperada:
```json
{
  "status": "OK",
  "message": "ValeFish Backend is running",
  "timestamp": "2026-01-26T10:00:00.000Z"
}
```

---

## 7️⃣ Configurar com Nginx (Opcional - Para Usar Domínio)

Se quiser usar um domínio, instale Nginx como reverse proxy:

```bash
apt install -y nginx

# Criar arquivo de configuração
nano /etc/nginx/sites-available/valefish
```

Adicione:

```nginx
upstream backend {
    server localhost:4000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://backend/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ativar a configuração:
```bash
ln -s /etc/nginx/sites-available/valefish /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 8️⃣ Configurar SSL (HTTPS com Let's Encrypt)

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Gerar certificado
certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Renovação automática
systemctl enable certbot.timer
```

---

## 🔄 Comandos Úteis para Gerenciamento

```bash
# Ver status dos containers
docker-compose ps

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Parar containers
docker-compose down

# Reiniciar
docker-compose restart

# Atualizar código e redeploy
cd /opt/ValeFish
git pull
docker-compose up -d --build

# Limpar imagens não usadas
docker system prune -a
```

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to Docker daemon"
```bash
sudo systemctl start docker
```

### Backend não conecta ao MongoDB
- Verificar se a URI está correta no `.env`
- Testar conexão: `curl -s http://localhost:4000/api/health`

### Frontend não carrega
- Verificar se `VITE_API_URL` está correto
- Abrir DevTools do navegador e verificar requisições

### Porta já em uso
```bash
# Verificar processo usando porta
lsof -i :3000
lsof -i :4000

# Matar processo
kill -9 <PID>
```

---

## ✅ Checklist Final

- [ ] SSH conectado à VPS
- [ ] Docker e Docker Compose instalados
- [ ] Repositório clonado em `/opt/ValeFish`
- [ ] Arquivo `.env` configurado
- [ ] Containers rodando (`docker-compose ps`)
- [ ] Frontend acessível em `http://72.61.62.17:3000`
- [ ] Backend respondendo em `http://72.61.62.17:4000/api/health`
- [ ] Você consegue fazer login na aplicação
- [ ] Dados são salvos no MongoDB Atlas

---

## 📞 Links Importantes

- **Frontend (IP):** http://72.61.62.17:3000
- **Backend Health (IP):** http://72.61.62.17:4000/api/health
- **GitHub:** https://github.com/ValeMilk/ValeFish
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas

---

## 🔐 Notas de Segurança

1. **Não commitizar credenciais** - O arquivo `.env` está no `.gitignore`
2. **Use HTTPS em produção** - Configure SSL com Certbot
3. **Mude JWT_SECRET** - Gere uma nova chave segura
4. **Backup regular** - Configure backups automáticos do MongoDB Atlas
5. **Firewall** - Configure iptables ou ufw para bloquear portas desnecessárias

```bash
# Exemplo de firewall básico
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

---

**Pronto para deploy! 🚀**
