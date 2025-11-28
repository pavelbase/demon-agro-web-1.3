#!/bin/bash

# Démon agro - Quick Start Script
# Tento skript nainstaluje závislosti a spustí vývojový server

echo "🌾 Démon agro - Převodní kalkulačka"
echo "===================================="
echo ""

# Check if node is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js není nainstalován!"
    echo "📥 Nainstalujte Node.js z: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js verze: $(node -v)"
echo "✅ npm verze: $(npm -v)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Instaluji závislosti..."
    npm install
    echo ""
fi

echo "🚀 Spouštím vývojový server..."
echo ""
echo "📍 Aplikace bude dostupná na: http://localhost:3000"
echo "⭐ Převodní kalkulačka: http://localhost:3000/kalkulacka/prevodni"
echo ""
echo "💡 Pro zastavení serveru stiskněte Ctrl+C"
echo ""

npm run dev
