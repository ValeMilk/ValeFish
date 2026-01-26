#!/bin/bash

# Script para monitorar saúde da aplicação

echo "🏥 Verificando saúde da ValeFish..."
echo ""

# Verificar containers
echo "📦 Status dos Containers:"
docker-compose ps

echo ""
echo "🔗 Testando Backend:"
curl -s http://localhost:4000/api/health | jq . || echo "❌ Backend indisponível"

echo ""
echo "📊 Uso de Recursos:"
docker stats --no-stream

echo ""
echo "📋 Últimas linhas de log (backend):"
docker-compose logs --tail=5 backend
