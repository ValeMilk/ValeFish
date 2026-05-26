#!/bin/bash
# 🔍 Script de investigação - Por que /api retorna HTML?

echo "════════════════════════════════════════════"
echo "🔍 Investigando problema de /api retornar HTML"
echo "════════════════════════════════════════════"
echo ""

# 1. Verificar se backend está rodando
echo "1️⃣  Testando backend na porta 4000..."
echo "   curl -s http://localhost:4000/api/health"
curl -s http://localhost:4000/api/health | jq . || echo "❌ Falha"
echo ""

# 2. Verificar se frontend está rodando
echo "2️⃣  Testando frontend na porta 8888..."
echo "   curl -s http://localhost:8888/ | head -5"
curl -s http://localhost:8888/ | head -5
echo ""

# 3. Testar /api/auth/users-list direto no backend
echo "3️⃣  Testando /api/auth/users-list direto no BACKEND (localhost:4000)..."
echo "   curl -s http://localhost:4000/api/auth/users-list"
BACKEND_RESP=$(curl -s http://localhost:4000/api/auth/users-list)
echo "$BACKEND_RESP" | jq . 2>/dev/null && echo "✅ Backend retorna JSON" || echo "❌ Erro: $BACKEND_RESP"
echo ""

# 4. Testar /api/auth/users-list direto no frontend
echo "4️⃣  Testando /api/auth/users-list direto no FRONTEND (localhost:8888)..."
echo "   curl -s http://localhost:8888/api/auth/users-list | head -10"
FRONTEND_RESP=$(curl -s http://localhost:8888/api/auth/users-list | head -10)
echo "$FRONTEND_RESP"
echo ""

# 5. Verificar configuração do Nginx
echo "5️⃣  Configuração atual do Nginx para valefish:"
echo "   cat /etc/nginx/sites-available/valefish.valemilk.com.br.conf"
cat /etc/nginx/sites-available/valefish.valemilk.com.br.conf
echo ""

# 6. Testar se Nginx faz proxy de /api corretamente
echo "6️⃣  Testando /api/auth/users-list VIA NGINX (localhost:80)..."
curl -s -H "Host: valefish.valemilk.com.br" http://localhost/api/auth/users-list | head -10
echo ""

echo "════════════════════════════════════════════"
echo "✅ Investigação completa!"
echo "════════════════════════════════════════════"
