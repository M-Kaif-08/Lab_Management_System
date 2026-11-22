#!/usr/bin/env bash
set -e

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore.sh <path_to_backup.sql>"
    exit 1
fi

echo "Restoring database from $BACKUP_FILE..."
docker exec -i lab_postgres psql -U postgres -d lab_db < "$BACKUP_FILE"

echo "Database restored successfully."
