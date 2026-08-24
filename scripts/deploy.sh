#!/bin/bash
# Deployment script for Solar Wildlife Monitoring Station

set -e

echo "🚀 Starting deployment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO="https://github.com/Ecospark-Innovations/Solar-powered-monitoring-station-wildlife-habitat-.git"
DEPLOY_DIR="/opt/wildlife-monitoring"
BACKUP_DIR="/backups/wildlife"

# Functions
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_info "Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { log_error "Docker not installed"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { log_error "Docker Compose not installed"; exit 1; }

log_info "Creating deployment directories..."
sudo mkdir -p $DEPLOY_DIR $BACKUP_DIR
sudo chown $USER:$USER $DEPLOY_DIR $BACKUP_DIR

log_info "Cloning repository..."
if [ -d "$DEPLOY_DIR/.git" ]; then
    cd $DEPLOY_DIR
    git pull origin main
else
    git clone -b main $REPO $DEPLOY_DIR
    cd $DEPLOY_DIR
fi

log_info "Checking for .env file..."
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    log_warn "No .env file found. Creating from template..."
    cp .env.example .env
    log_warn "Please edit .env with your settings: nano $DEPLOY_DIR/.env"
    exit 0
fi

log_info "Building and starting services..."
docker-compose down
docker-compose build
docker-compose up -d

log_info "Running database migrations..."
sleep 10
docker-compose exec -T backend npm run migrate

log_info "Verifying services..."
echo "Checking API..."
curl -f http://localhost:3000/health || { log_error "API not responding"; exit 1; }
echo ""
log_info "✅ API is running"

echo "Checking Database..."
docker-compose exec -T db pg_isready -U wildlife || { log_error "Database not responding"; exit 1; }
log_info "✅ Database is running"

echo "Checking Frontend..."
curl -f http://localhost:3001 >/dev/null 2>&1 || { log_error "Frontend not responding"; exit 1; }
log_info "✅ Frontend is running"

log_info "Creating backup schedule..."
BACKUP_SCRIPT="#!/bin/bash
BACKUP_DIR=\"$BACKUP_DIR\"
DATE=\$(date +%Y%m%d_%H%M%S)
cd $DEPLOY_DIR
docker-compose exec -T db pg_dump -U wildlife wildlife_monitoring > \$BACKUP_DIR/db_\$DATE.sql
tar -czf \$BACKUP_DIR/uploads_\$DATE.tar.gz uploads/ 2>/dev/null || true
find \$BACKUP_DIR -name \"*.sql\" -mtime +30 -delete
find \$BACKUP_DIR -name \"*.tar.gz\" -mtime +30 -delete
"

sudo tee /usr/local/bin/backup-wildlife.sh > /dev/null << 'EOF'
#!/bin/bash
BACKUP_DIR="$BACKUP_DIR"
DATE=$(date +%Y%m%d_%H%M%S)
cd $DEPLOY_DIR
docker-compose exec -T db pg_dump -U wildlife wildlife_monitoring > $BACKUP_DIR/db_$DATE.sql
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/ 2>/dev/null || true
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
EOF

sudo chmod +x /usr/local/bin/backup-wildlife.sh

log_info "🎉 Deployment successful!"
echo ""
echo "📊 Service URLs:"
echo "   API: http://localhost:3000"
echo "   Frontend: http://localhost:3001"
echo "   Logs: docker-compose logs -f"
echo ""
echo "📚 Next steps:"
echo "   1. Configure your domain and SSL"
echo "   2. Create first user account"
echo "   3. Register monitoring stations"
echo "   4. Check docs/DEPLOYMENT.md for production setup"
echo ""
