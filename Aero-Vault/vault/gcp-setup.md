# GCP Deployment Guide

## Initial Setup

```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

## Create a VM Instance

```bash
gcloud compute instances create my-vm \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=debian-11 \
  --image-project=debian-cloud \
  --boot-disk-size=20GB
```

## SSH into VM

```bash
gcloud compute ssh my-vm --zone=us-central1-a
```

## Firewall Rules

```bash
# Allow HTTP
gcloud compute firewall-rules create allow-http \
  --allow=tcp:80 --target-tags=http-server

# Allow HTTPS
gcloud compute firewall-rules create allow-https \
  --allow=tcp:443 --target-tags=https-server
```

## Deploy to Cloud Run

```bash
gcloud run deploy my-service \
  --image gcr.io/PROJECT_ID/my-image \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```
