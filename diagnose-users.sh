#!/bin/bash
# 🔧 Script de Diagnóstico - Lista de Usuários

echo "📊 Diagnóstico do endpoint /auth/users-list"
echo "=============================================="

# 1. Verificar se backend está rodando
echo ""
echo "1️⃣  Testando conexão com backend..."
curl -s http://localhost:4000/api/health -w "\nStatus: %{http_code}\n" || echo "❌ Falha de conexão"

# 2. Testar endpoint de usuários
echo ""
echo "2️⃣  Testando endpoint /auth/users-list..."
curl -s http://localhost:4000/api/auth/users-list -w "\nStatus: %{http_code}\n" | head -20

# 3. Verificar logs do backend
echo ""
echo "3️⃣  Últimas linhas do log do backend:"
docker-compose logs backend | tail -20

# 4. Verificar CORS
echo ""
echo "4️⃣  Testando CORS (pode vir do Nginx):"
curl -s -H "Origin: https://valefish.valemilk.com.br" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:4000/api/auth/users-list \
     -w "\nStatus: %{http_code}\n"

echo ""
echo "✅ Diagnóstico completo!"
