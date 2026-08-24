# Solar-Powered Wildlife Monitoring Station

## Docker Deployment

### Quick Start

```bash
# Clone repository
git clone https://github.com/Ecospark-Innovations/Solar-powered-monitoring-station-wildlife-habitat-.git
cd Solar-powered-monitoring-station-wildlife-habitat-

# Create environment file
cp .env.example .env

# Edit .env with your settings
nano .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### Environment Configuration

Create `.env` file in project root:

```env
# Database
DB_USER=wildlife
DB_PASSWORD=secure_password_here
DB_NAME=wildlife_monitoring

# API
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-here
API_KEY=your-api-key-here

# Frontend
API_BASE_URL=http://localhost:3000/api
MAP BOX_TOKEN=your_mapbox_token

# AWS S3 (for image storage)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET=wildlife-monitoring-images

# CORS
ALLOWED_ORIGINS=http://localhost:3001,https://yourdomain.com
```

### Service URLs

- **API**: http://localhost:3000
- **Frontend**: http://localhost:3001
- **Database**: localhost:5432
- **Redis**: localhost:6379

### Database Migration

```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed initial data
docker-compose exec backend npm run seed
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Stop Services

```bash
docker-compose down

# With volume cleanup
docker-compose down -v
```

---

## Production Deployment

### Prerequisites

- Ubuntu 20.04 LTS (or similar Linux)
- Docker & Docker Compose
- SSL Certificate (Let's Encrypt)
- Domain name
- 2GB RAM minimum, 10GB storage

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 2: Deploy Application

```bash
# Clone repository
git clone https://github.com/Ecospark-Innovations/Solar-powered-monitoring-station-wildlife-habitat-.git
cd Solar-powered-monitoring-station-wildlife-habitat-

# Configure environment
sudo nano .env

# Start services
docker-compose up -d
```

### Step 3: Configure SSL

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy to nginx
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./nginx/ssl/

# Restart nginx
docker-compose restart nginx
```

### Step 4: Automated Backups

```bash
# Create backup script
sudo nano /usr/local/bin/backup-wildlife.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/wildlife"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker-compose exec -T db pg_dump -U wildlife wildlife_monitoring > $BACKUP_DIR/db_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/

# Keep last 30 days
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-wildlife.sh

# Schedule daily backup at 2 AM
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-wildlife.sh
```

### Step 5: Monitoring

```bash
# View service status
docker-compose ps

# Check resource usage
docker stats

# View application logs
docker-compose logs --tail=50 -f backend
```

---

## Scaling Configuration

### For High Traffic

Update `docker-compose.yml`:

```yaml
# Use multiple backend instances
backend:
  replicas: 3

# Configure load balancing in nginx
location /api/ {
  upstream backend {
    server backend-1:3000;
    server backend-2:3000;
    server backend-3:3000;
  }
  proxy_pass http://backend;
}
```

### Database Optimization

```bash
# Connect to database
docker-compose exec db psql -U wildlife -d wildlife_monitoring

# Create indexes
CREATE INDEX idx_telemetry_device_time ON telemetry(device_id, created_at DESC);
CREATE INDEX idx_events_device_type ON events(device_id, event_type, created_at DESC);
CREATE INDEX idx_telemetry_time ON telemetry(created_at DESC);
```

---

## Troubleshooting

### Database Connection Error

```bash
# Check database status
docker-compose ps db

# Restart database
docker-compose restart db

# Check logs
docker-compose logs db
```

### High Memory Usage

```bash
# Increase heap size
NODE_OPTIONS: "--max-old-space-size=1024"
```

### API Not Responding

```bash
# Check backend logs
docker-compose logs backend

# Restart service
docker-compose restart backend
```

### SSL Certificate Error

```bash
# Renew certificate
sudo certbot renew --dry-run

# Recreate with new cert
sudo certbot certonly --standalone -d yourdomain.com --force-renewal
```

---

## Security Best Practices

1. **Change default passwords** in `.env`
2. **Enable firewall**
   ```bash
   sudo ufw enable
   sudo ufw allow 22,80,443/tcp
   ```
3. **Regular updates**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```
4. **Database backups** (automated daily)
5. **API rate limiting** (configured)
6. **JWT expiration** (7 days by default)

---

## Support

For issues or questions:
- 📧 Email: support@ecospark-innovations.org
- 📖 Docs: https://docs.yourdomain.com
- 🐛 Issues: https://github.com/Ecospark-Innovations/Solar-powered-monitoring-station-wildlife-habitat-/issues

