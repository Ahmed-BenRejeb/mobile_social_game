#!/bin/bash
minikube start --memory=6144 --cpus=4
minikube addons enable ingress
minikube addons enable metrics-server
minikube addons enable dashboard


kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

kubectl create namespace monitoring
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

ubectl wait --for=condition=ready pod --all -n argocd --timeout=300s

kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=grafana -n monitoring --timeout=300s

argocd_pwd=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo) 
grafana_pwd=$(kubectl get secret --namespace monitoring monitoring-grafana -o jsonpath="{.data.admin-password}" | base64 --decode; echo)
echo "ArgoCD initial admin password: $argocd_pwd"
echo "Grafana admin password: $grafana_pwd"


nohup kubectl port-forward svc/argocd-server -n argocd 8080:443 &
nohup kubectl port-forward svc/monitoring-grafana -n monitoring 3000:80

minikube ip 
minikube dashboard