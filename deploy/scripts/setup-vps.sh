#!/usr/bin/env bash
set -e

echo "==================================================="
echo "Setting up Laboratory Management System (Dedicated VPS)"
echo "==================================================="

if [ ! -f ../.env ]; then
    echo "Creating .env from VPS template..."
    cp ../env/.env.vps.example ../.env
    echo "PLEASE EDIT ../.env WITH YOUR DOMAIN AND SECRETS BEFORE RUNNING!"
    exit 1
fi

cd ..
docker compose -f docker-compose.yml -f docker-compose.override.vps.yml up -d --build

echo "Dedicated VPS Deployment is running with automatic SSL!"
