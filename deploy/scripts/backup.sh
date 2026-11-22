#!/usr/bin/env bash
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

echo "Creating database backup..."
docker exec -t lab_postgres pg_dump -U postgres lab_db > "$BACKUP_DIR/db_$TIMESTAMP.sql"

echo "Compressing storage..."
tar -czf "$BACKUP_DIR/storage_$TIMESTAMP.tar.gz" -C apps/api/storage . 2>/dev/null || true

echo "Backup complete: $BACKUP_DIR/db_$TIMESTAMP.sql"
