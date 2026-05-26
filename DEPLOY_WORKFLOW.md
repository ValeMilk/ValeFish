# 📦 Workflow: Git → Pull → Docker Build

## 1️⃣ Fazer Commit e Push das Mudanças

Localmente (seu PC):

```bash
# Entrar na pasta do projeto
cd c:\Users\LENOVO\ 059\Desktop\ValeFish

# Ver status das mudanças
git status

# Adicionar todas as mudanças
git add .

# Commit com mensagem clara
git commit -m "fix: melhorar fetch de usuários no login e logging do backend"

# Fazer push para o repositório
git push origin main
```

### Mudanças que serão enviadas:
- ✅ `frontend/src/components/Login.tsx` - Melhor tratamento de fetch
- ✅ `backend/src/routes/auth.ts` - Logging detalhado
- ✅ `diagnose-users.sh` - Script de diagnóstico

---

## 2️⃣ Na VPS, Puxar as Atualizações

SSH na VPS:
```bash
ssh root@72.61.62.17
cd /opt/ValeFish

# Puxar as mudanças do Git
git pull origin main

# Ver o que foi atualizado
git log --oneline -5
```

---

## 3️⃣ Reconstruir o Docker

```bash
# Parar os containers
docker-compose down

# Reconstruir as imagens com as mudanças
docker-compose up -d --build

# Acompanhar os logs de build
docker-compose logs -f
```

---

## 4️⃣ Validar se Funcionou

```bash
# 1. Verificar se os serviços estão rodando
docker-compose ps

# 2. Testar endpoint de usuários
curl http://localhost:4000/api/auth/users-list

# 3. Acessar https://valefish.valemilk.com.br
# Abrir Console (F12) e procurar por:
# 🔍 Buscando usuários em:...
```

---

## ⚡ Atalho (Tudo em Um Comando)

Na VPS:
```bash
cd /opt/ValeFish && git pull origin main && docker-compose down && docker-compose up -d --build && docker-compose logs -f backend
```

---

**Pronto! Esse é o workflow correto para produção.** ✅
