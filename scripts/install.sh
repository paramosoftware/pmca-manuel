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

#check if pm2 is installed
if ! command -v pm2 &> /dev/null
then
    echo "Installing PM2"
    npm install -g pm2
fi

PROJECT_ROOT=$(pwd)

echo "Creating .env file"
cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"

echo "What is the absolute path to the project data directory? (Default: $PROJECT_ROOT/data)"
read -r DATA_DIR

if [ -z "$DATA_DIR" ]; then
    DATA_DIR="$PROJECT_ROOT/data"
fi

echo "What is the Prisma database url? (Default: file:$DATA_DIR/db/app.sqlite)"
read -r DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    DATABASE_URL="file:$DATA_DIR/db/app.sqlite"
fi

echo "What is the Nuxt base url? (Default: http://localhost:3000)"
read -r BASE_URL

if [ -z "$BASE_URL" ]; then
    BASE_URL="http://localhost:3000"
fi

echo "Generating secrets"
ACCESS_TOKEN_SECRET=$(tr -dc A-Za-z0-9 </dev/urandom | head -c 64; echo)
REFRESH_TOKEN_SECRET=$(tr -dc A-Za-z0-9 </dev/urandom | head -c 64; echo)

echo "Updating .env file"
sed -i "s|DATA_DIR=.*|DATA_DIR=$DATA_DIR|g" "$PROJECT_ROOT/.env"
sed -i "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|g" "$PROJECT_ROOT/.env"
sed -i "s|NUXT_PUBLIC_BASE_URL=.*|NUXT_PUBLIC_BASE_URL=$BASE_URL|g" "$PROJECT_ROOT/.env"
sed -i "s|ACCESS_TOKEN_SECRET=.*|ACCESS_TOKEN_SECRET=$ACCESS_TOKEN_SECRET|g" "$PROJECT_ROOT/.env"
sed -i "s|REFRESH_TOKEN_SECRET=.*|REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET|g" "$PROJECT_ROOT/.env"

echo "Setting up project"
pnpm scaffold


