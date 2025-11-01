# Kubernetes Deployment Guide

## Prerequisites

1. Kubernetes cluster (1.21+)
2. kubectl configured
3. NGINX Ingress Controller installed
4. cert-manager installed (for SSL)

## Installation

### 1. Install NGINX Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

### 2. Install cert-manager (for automatic SSL)

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### 3. Create namespace

```bash
kubectl create namespace production
```

### 4. Create secrets

```bash
# Database connection
kubectl create secret generic sitebuilder-secrets \
  --from-literal=database-url="postgresql://user:password@host:5432/db" \
  --from-literal=redis-url="redis://:password@host:6379" \
  --from-literal=nextauth-secret="$(openssl rand -base64 32)" \
  --from-literal=sentry-dsn="your-sentry-dsn" \
  -n production

# GitHub Container Registry
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_GITHUB_TOKEN \
  -n production
```

### 5. Apply configurations

```bash
# ConfigMap
kubectl apply -f k8s/configmap.yml

# Deployment and Service
kubectl apply -f k8s/deployment.yml

# Ingress
kubectl apply -f k8s/ingress.yml
```

## Verify deployment

```bash
# Check pods
kubectl get pods -n production

# Check services
kubectl get svc -n production

# Check ingress
kubectl get ingress -n production

# View logs
kubectl logs -f deployment/sitebuilder-app -n production

# Describe pod
kubectl describe pod <pod-name> -n production
```

## Scaling

```bash
# Manual scaling
kubectl scale deployment sitebuilder-app --replicas=5 -n production

# HPA is configured automatically (3-10 replicas based on CPU/Memory)
kubectl get hpa -n production
```

## Updates

```bash
# Update image
kubectl set image deployment/sitebuilder-app app=ghcr.io/yourorg/sitebuilder:v1.2.3 -n production

# Rollout status
kubectl rollout status deployment/sitebuilder-app -n production

# Rollback
kubectl rollout undo deployment/sitebuilder-app -n production
```

## Database migrations

```bash
# Run migrations
kubectl run -it --rm prisma-migrate \
  --image=ghcr.io/yourorg/sitebuilder:latest \
  --restart=Never \
  --env="DATABASE_URL=postgresql://..." \
  -- npx prisma migrate deploy
```

## Troubleshooting

```bash
# Pod not starting
kubectl describe pod <pod-name> -n production
kubectl logs <pod-name> -n production

# Service not accessible
kubectl get endpoints -n production
kubectl describe service sitebuilder-app -n production

# Ingress issues
kubectl describe ingress sitebuilder-ingress -n production
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

## Clean up

```bash
kubectl delete -f k8s/ -n production
kubectl delete namespace production
```
