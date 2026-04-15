#!/bin/sh

# Falha o script se algum comando der erro
set -e

echo "➡️ Navegando para a raiz do projeto..."
cd $CI_PRIMARY_REPOSITORY_PATH

echo "➡️ Instalando o Node.js..."
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
brew install node || brew link --overwrite node

echo "➡️ Instalando o Bun..."
# Como o Node acabou de ser instalado, usamos o npm para instalar o Bun globalmente
npm install -g bun

echo "➡️ Instalando as dependências do projeto com Bun..."
bun install

echo "➡️ Instalando os Pods do iOS..."
cd ios
pod install --repo-update

echo "✅ Script pós-clone finalizado com sucesso!"