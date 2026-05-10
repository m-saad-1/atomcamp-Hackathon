#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# AI Recruiting Agent — ONE-CLICK GCP DEPLOY SCRIPT
# Paste this ENTIRE script into GCP Cloud Shell and press Enter.
# ══════════════════════════════════════════════════════════════════════════════
set -e

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║  FILL IN THESE 6 VALUES BEFORE RUNNING — REPLACE THE PLACEHOLDERS       ║
# ╚════════════════════════════════════════════════════════════════════════════╝

SUPABASE_URL="YOUR_SUPABASE_URL"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_KEY="YOUR_SUPABASE_SERVICE_KEY"
OPENAI_KEY="YOUR_OPENAI_API_KEY"
GOOGLE_CID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CSECRET="YOUR_GOOGLE_CLIENT_SECRET"

# ══════════════════════════════════════════════════════════════════════════════
# DO NOT EDIT BELOW THIS LINE
# ══════════════════════════════════════════════════════════════════════════════

PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
REGION="us-central1"
SERVICE_NAME="ai-recruiter"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"
NEXTAUTH_SECRET_VAL=$(openssl rand -base64 32)

echo "============================================"
echo "  Deploying AI Recruiting Agent to GCP"
echo "  Project: $PROJECT_ID"
echo "============================================"

# ── Step 1: Create secrets ───────────────────────────────────────────────────
echo ">>> Creating secrets in Secret Manager..."

create_secret() {
  local name=$1
  local value=$2
  if gcloud secrets describe "$name" --project="$PROJECT_ID" &>/dev/null; then
    echo "    Secret '$name' exists — adding new version..."
    echo -n "$value" | gcloud secrets versions add "$name" --data-file=- --project="$PROJECT_ID"
  else
    echo "    Creating secret '$name'..."
    echo -n "$value" | gcloud secrets create "$name" --data-file=- --project="$PROJECT_ID"
  fi
}

create_secret "supabase-service-key" "$SUPABASE_SERVICE_KEY"
create_secret "openai-api-key" "$OPENAI_KEY"
create_secret "google-client-id" "$GOOGLE_CID"
create_secret "google-client-secret" "$GOOGLE_CSECRET"
create_secret "nextauth-secret" "$NEXTAUTH_SECRET_VAL"

echo "✅ Secrets created."

# ── Step 2: Grant IAM permissions ────────────────────────────────────────────
echo ">>> Granting IAM permissions..."

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin" --quiet 2>/dev/null || true

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser" --quiet 2>/dev/null || true

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" --quiet 2>/dev/null || true

echo "✅ Permissions granted."

# ── Step 3: Clone repo and build ─────────────────────────────────────────────
echo ">>> Cloning repo and building Docker image..."

cd /tmp
rm -rf atomcamp-Hackathon
git clone https://github.com/m-saad-1/atomcamp-Hackathon.git
cd atomcamp-Hackathon

gcloud builds submit \
  --tag "$IMAGE" \
  --timeout=1200 \
  --quiet

echo "✅ Docker image built and pushed."

# ── Step 4: Deploy to Cloud Run ──────────────────────────────────────────────
echo ">>> Deploying to Cloud Run..."

gcloud run deploy $SERVICE_NAME \
  --image "$IMAGE" \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --timeout 300 \
  --set-secrets="SUPABASE_SERVICE_ROLE_KEY=supabase-service-key:latest,OPENAI_API_KEY=openai-api-key:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest,NEXTAUTH_SECRET=nextauth-secret:latest" \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL},NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY},NODE_ENV=production" \
  --quiet

echo "✅ Cloud Run service deployed."

# ── Step 5: Get URL and update NEXTAUTH_URL ──────────────────────────────────
CLOUD_RUN_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")

echo ">>> Updating NEXTAUTH_URL to: $CLOUD_RUN_URL"

gcloud run services update $SERVICE_NAME \
  --region $REGION \
  --update-env-vars="NEXTAUTH_URL=${CLOUD_RUN_URL}" \
  --quiet

echo ""
echo "============================================"
echo "  ✅ DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo "  🌐 Your app is live at:"
echo "     $CLOUD_RUN_URL"
echo ""
echo "  ⚠️  ONE MANUAL STEP LEFT:"
echo "  Go to Google Cloud Console → APIs & Services → Credentials"
echo "  → Your OAuth 2.0 Client ID → Add these:"
echo ""
echo "  Authorized JavaScript origins:"
echo "     $CLOUD_RUN_URL"
echo ""
echo "  Authorized redirect URIs:"
echo "     ${CLOUD_RUN_URL}/api/auth/callback/google"
echo ""
echo "============================================"