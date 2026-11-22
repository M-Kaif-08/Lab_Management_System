#!/usr/bin/env bash
set -e

echo "Updating Laboratory Management System..."
git pull origin main

echo "Rebuilding and restarting containers..."
docker compose pull || true
docker compose up -d --build

echo "Update complete."
