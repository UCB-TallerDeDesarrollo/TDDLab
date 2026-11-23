#!/usr/bin/env bash
set -euo pipefail

runtime_env=()
for name in TDD_DATABASE_URL TDD_SYNC_CREDENTIALS TDD_SYNC_URL; do
  if [[ -n "${!name:-}" ]]; then
    runtime_env+=(--env "$name=${!name}")
  fi
done

vercel deploy --prod --token "$VERCEL_TOKEN" -y "${runtime_env[@]}"
