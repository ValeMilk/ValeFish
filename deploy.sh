#!/bin/bash

# Script para fazer deploy da ValeFish na VPS

echo "🚀 ValeFish Deployment Script"
echo "=============================="

# 1. Atualizar código do repositório
echo "📥 Pulling latest changes..."
git pull origin main

# 2. Configurar variáveis de ambiente
if [ ! -f .env ]; then
    echo "⚠️ .env não encontrado!"
    echo "Copie .env.production para .env e configure as variáveis:"
    cp .env.production .env
    echo "✅ Arquivo .env criado. Configure as variáveis de ambiente!"
    exit 1
fi

# 3. Parar containers antigos
echo "🛑 Stopping old containers..."
docker-compose down

# 4. Build e iniciar novos containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# 5. Verificar status
echo "✅ Deployment concluído!"
echo ""
echo "Status dos containers:"
docker-compose ps

echo ""
echo "📍 URLs:"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:4000"
echo "Health:   http://localhost:4000/api/health"
