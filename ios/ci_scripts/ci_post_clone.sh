#!/bin/sh

# Falha o script se algum comando der erro
set -e

echo "➡️ Navegando para a raiz do projeto..."
cd $CI_PRIMARY_REPOSITORY_PATH

echo "➡️ Instalando o Node.js..."
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
brew install node

echo "➡️ Instalando as dependências do projeto..."
bun install

echo "➡️ Instalando os Pods do iOS..."
cd ios
pod install

echo "✅ Configuração concluída com sucesso!"