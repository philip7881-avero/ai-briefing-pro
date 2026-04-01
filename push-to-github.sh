#!/bin/bash
# Script para subir ai-briefing-pro a GitHub
cd "$(dirname "$0")"
echo "📦 Inicializando repositorio git..."
git init
git add .
git commit -m "Initial commit: AI Briefing Pro - Para los JODA"
git branch -M main
git remote add origin https://github.com/philip7881-avero/ai-briefing-pro.git
echo "🚀 Subiendo a GitHub..."
git push -u origin main
echo "✅ ¡Listo! Código subido exitosamente."
echo "👉 Ahora ve a https://vercel.com/new para hacer deploy"
