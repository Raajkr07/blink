#!/bin/bash

echo "🛑 Stopping and removing any existing Datadog Agent container..."
docker stop datadog-agent || true
docker rm datadog-agent || true

echo "🚀 Starting Datadog Agent with Doppler secrets..."

docker run -d --name datadog-agent \
  -e DD_API_KEY=$(doppler secrets get DD_API_KEY --plain) \
  -e DD_SITE=us5.datadoghq.com \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  gcr.io/datadoghq/agent:7

echo "✅ Datadog Agent deployment complete!"
docker ps | grep datadog-agent
