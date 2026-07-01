#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== MonaBit — Full Deployment ==="

echo ""
echo "--- 1. Deploying API ---"
cd "$SCRIPT_DIR/api"
./gcloud-deploy.sh

echo ""
echo "--- 2. Deploying Frontend ---"
cd "$SCRIPT_DIR/web"
./gcloud-deploy.sh

echo ""
echo "=== Deployment complete ==="
echo "Don't forget: if the frontend URL changed, update CORS_ORIGIN in api-env.yaml"
echo "and re-deploy the API: cd api && ./gcloud-deploy.sh"
