#!/bin/bash
set -e

# Find gcloud SDK
GCLOUD_PATH=$(find /Users/jeannuelgarcia -path "*/google-cloud-sdk/bin/gcloud" -type f 2>/dev/null | head -1)
if [ -n "$GCLOUD_PATH" ]; then
  export PATH="$(dirname "$GCLOUD_PATH"):$PATH"
fi

if ! command -v gcloud &>/dev/null; then
  echo "Error: gcloud CLI not found."
  exit 1
fi

echo "=== Deploying monabit-web ==="
cd "$(dirname "$0")"

if [ ! -f web-env.yaml ]; then
  echo "Error: web-env.yaml not found. Copy web-env.yaml.example and fill in values."
  exit 1
fi

# Backup local .env and write production VITE_ vars for the build
if [ -f .env ]; then
  cp .env .env.local.bak
  echo "Backed up existing .env → .env.local.bak"
fi

# Write VITE_ vars from web-env.yaml into .env (Vite reads this at build time)
# .env is in .gitignore — values never committed
> .env
while IFS= read -r line; do
  key="${line%%:*}"
  key="${key## }"
  value="${line#*: }"
  value="${value#\"}"
  value="${value%\"}"
  value="${value%% }"
  echo "${key}=${value}" >> .env
done < <(grep "^VITE_" web-env.yaml)

echo "Created .env with production VITE_ vars from web-env.yaml"

gcloud run deploy monabit-web \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --env-vars-file web-env.yaml

# Restore original .env
if [ -f .env.local.bak ]; then
  mv .env.local.bak .env
  echo "Restored original .env"
fi

echo ""
echo "Frontend deployed. URL:"
gcloud run services describe monabit-web --region us-central1 --format 'value(status.url)'
