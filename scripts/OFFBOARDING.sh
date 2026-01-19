#!/usr/bin/env bash
# OFFBOARDING.sh
# Usage: ./OFFBOARDING.sh <github-username> <user-email> <azure-user-object-id>
# Run as an admin with gh, aws, gcloud, and az CLIs configured.

set -euo pipefail
USER="$1"
USER_EMAIL="${2:-}"
USER_OBJECT_ID="${3:-}"
ORG="YOUR_ORG"
PROJECT_ID="YOUR_GCP_PROJECT"

if [ -z "$USER" ]; then
  echo "Usage: $0 <github-username> <user-email> <azure-user-object-id>"
  exit 2
fi

echo "Removing $USER from GitHub org and teams..."
gh api orgs/$ORG/memberships/$USER -X DELETE || true
# remove from common teams
for team in junior-devs senior-devs contractors infra-team; do
  gh api orgs/$ORG/teams/$team/memberships/$USER -X DELETE || true
done

echo "Revoking AWS keys for $USER (if any)..."
aws iam list-access-keys --user-name "$USER" --query 'AccessKeyMetadata[].AccessKeyId' --output text | tr '\t' '\n' | while read -r KEY; do
  [ -z "$KEY" ] && continue
  aws iam delete-access-key --user-name "$USER" --access-key-id "$KEY" || true
  echo "Deleted AWS key $KEY"
done
aws iam update-login-profile --user-name "$USER" --password-reset-required || true

if [ -n "$USER_EMAIL" ]; then
  echo "Removing GCP IAM bindings for $USER_EMAIL..."
  gcloud projects remove-iam-policy-binding "$PROJECT_ID" --member="user:$USER_EMAIL" --role="roles/editor" || true
fi

if [ -n "$USER_OBJECT_ID" ]; then
  echo "Revoking Azure sign-in sessions for $USER_OBJECT_ID..."
  az ad user revoke-sign-in-sessions --id "$USER_OBJECT_ID" || true
fi

echo "Disabling any remaining service account keys owned by user (GCP)..."
# This requires appropriate permissions and may need adapting to your org.
# gcloud iam service-accounts keys list --iam-account=svc@${PROJECT_ID}.iam.gserviceaccount.com

echo "Reminder: rotate affected secrets in your secret manager(s):"
echo " - Rotate DB passwords, API keys, service accounts that the user had access to"

echo "Offboarding for $USER completed (commands ran). Verify audit logs and rotate secrets as needed."
