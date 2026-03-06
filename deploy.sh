#!/bin/bash
# Deploy Rostcipes on Ubuntu EC2
# Run this script on the EC2 instance

set -e

echo "=== Rostcipes Deploy Script ==="

# 1. Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker $USER
    echo "Docker installed. Log out and back in for group changes, then re-run this script."
    exit 0
fi

# 2. Clone or pull repo
APP_DIR=~/rostcipes
if [ -d "$APP_DIR" ]; then
    echo "Pulling latest code..."
    cd "$APP_DIR"
    git pull origin main
else
    echo "Cloning repo..."
    git clone https://github.com/MorROST/Rostcipes.git "$APP_DIR"
    cd "$APP_DIR"
fi

# 3. Check for .env.local
if [ ! -f .env.local ]; then
    echo ""
    echo "ERROR: .env.local not found!"
    echo "Create it with: nano $APP_DIR/.env.local"
    echo "Then re-run this script."
    exit 1
fi

# 4. Build and start
echo "Building and starting containers..."
docker compose down 2>/dev/null || true
docker compose up -d --build

echo ""
echo "=== Deploy complete ==="
echo "App running at: http://$(curl -s ifconfig.me)"
echo ""
echo "To view logs:  docker compose logs -f"
echo "To stop:       docker compose down"
echo "To redeploy:   ./deploy.sh"
