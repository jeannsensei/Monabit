#!/bin/bash
set -e

# Find gcloud SDK — installed locally at Monabit Docs
GCLOUD_PATH=$(find /Users/jeannuelgarcia -path "*/google-cloud-sdk/bin/gcloud" -type f 2>/dev/null | head -1)
if [ -n "$GCLOUD_PATH" ]; then
  export PATH="$(dirname "$GCLOUD_PATH"):$PATH"
fi

if ! command -v gcloud &>/dev/null; then
  echo "Error: gcloud CLI not found."
  echo "Install from https://cloud.google.com/sdk/docs/install"
  exit 1
fi

echo "=== Deploying monabit-api ==="
cd "$(dirname "$0")"

if [ ! -f api-env.yaml ]; then
  echo "Error: api-env.yaml not found. Copy api-env.yaml.example and fill in values."
  exit 1
fi

gcloud run deploy monabit-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --env-vars-file api-env.yaml

echo ""
echo "API deployed. URL:"
gcloud run services describe monabit-api --region us-central1 --format 'value(status.url)'
