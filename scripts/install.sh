#!/bin/bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

export PNPM_HOME="$HOME/.pnpm"

if ! command -v nvm &> /dev/null
then
    echo "Installing NVM"
    wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi


if ! nvm list | grep -q "v20.10.0";
then
    echo "Installing Node v20.10.0"
    nvm install v20.10.0
fi


if ! command -v pnpm &> /dev/null
then
    echo "Installing PNPM"
    corepack enable && corepack prepare pnpm@latest --activate
fi
