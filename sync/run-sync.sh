#!/bin/bash
# Script wrapper para el sync worker de ESCALA
# Usado por crontab para asegurar que Node 20 está disponible

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20 --silent

cd /Users/rodboss/conductor/workspaces/APP/tokyo/sync
node worker.js >> /tmp/escala-sync.log 2>&1
