# 🐳 Dockerized E-commerce MCP + Python LangChain Agent

A complete Dockerized setup for the AI-powered e-commerce assistant using Model Context Protocol (MCP) and LangChain.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   E-commerce    │    │   MCP Server    │    │  Python Agent   │
│      API        │◄───┤   (TypeScript)  │◄───┤   (LangChain)   │
│   (Your API)    │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    MongoDB      │    │     Redis       │    │   OpenAI API    │
│   (Database)    │    │   (Caching)     │    │   (External)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. Prerequisites

- Docker and Docker Compose installed
- OpenAI API key

### 2. Setup

```bash
# Clone and navigate to the project
git clone <your-repo>
cd milagrou

# Run the setup script
./docker-setup.sh
```

### 3. Configure Environment

Edit the `.env` file with your settings:

```env
# Required
OPENAI_API_KEY=your-actual-openai-api-key-here

# Optional (defaults provided)
JWT_SECRET=your-super-secret-jwt-key-here
MONGODB_URI=mongodb://admin:password@mongodb:27017/ecommerce?authSource=admin
```

### 4. Start Services

```bash
# Production mode
./docker-start.sh

# Development mode (with hot reload)
./docker-start-dev.sh
```

## 🎯 Available Commands

| Command | Description |
|---------|-------------|
| `./docker-setup.sh` | Initial setup and build |
| `./docker-start.sh` | Start all services (production) |
| `./docker-start-dev.sh` | Start in development mode |
| `./docker-stop.sh` | Stop all services |
| `./docker-logs.sh` | View logs for all services |
| `./docker-logs.sh <service>` | View logs for specific service |
| `./docker-test.sh` | Run integration tests |
| `./docker-clean.sh` | Clean up all Docker resources |

## 🌐 Service Endpoints

| Service | URL | Description |
|---------|-----|-------------|
| E-commerce API | http://localhost:3000/api | Your existing API |
| Python Agent API | http://localhost:8000 | AI Agent REST API |
| API Documentation | http://localhost:8000/docs | Interactive API docs |
| MongoDB | localhost:27017 | Database |
| Redis | localhost:6379 | Caching |

## 🛠️ Development Mode

For development with hot reload:

```bash
# Start in development mode
./docker-start-dev.sh

# View logs
./docker-logs.sh

# Stop when done
./docker-stop.sh
```

### Development Features

- **Hot Reload**: Code changes automatically restart services
- **Volume Mounting**: Source code is mounted for live editing
- **Development Dependencies**: Includes testing and linting tools
- **Debug Logging**: Enhanced logging for development

## 🧪 Testing

```bash
# Run integration tests
./docker-test.sh

# Test specific service
docker-compose exec python-agent python test_integration.py
```

## 📊 Monitoring

### View Logs

```bash
# All services
./docker-logs.sh

# Specific service
./docker-logs.sh python-agent
./docker-logs.sh mcp-server
./docker-logs.sh mongodb
```

### Health Checks

```bash
# Check service status
docker-compose ps

# Check health
curl http://localhost:8000/health
curl http://localhost:3000/api
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | Required | OpenAI API key for GPT-4 |
| `JWT_SECRET` | Generated | JWT signing secret |
| `MONGODB_URI` | mongodb://admin:password@mongodb:27017/ecommerce | Database connection |
| `API_BASE_URL` | http://ecommerce-api:3000/api | E-commerce API URL |
| `PORT` | 8000 | Python agent port |

### Docker Compose Files

- `docker-compose.yml` - Production configuration
- `docker-compose.dev.yml` - Development configuration
- `docker-compose.override.yml` - Local overrides

## 🐛 Troubleshooting

### Common Issues

1. **Services won't start**
   ```bash
   # Check Docker is running
   docker --version
   
   # Check logs
   ./docker-logs.sh
   ```

2. **OpenAI API errors**
   ```bash
   # Verify API key in .env
   grep OPENAI_API_KEY .env
   ```

3. **Database connection issues**
   ```bash
   # Check MongoDB logs
   ./docker-logs.sh mongodb
   
   # Test connection
   docker-compose exec mongodb mongosh --eval "db.runCommand('ping')"
   ```

4. **Port conflicts**
   ```bash
   # Check what's using ports
   lsof -i :3000
   lsof -i :8000
   lsof -i :27017
   ```

### Debug Mode

```bash
# Start with debug logging
DEBUG=1 ./docker-start-dev.sh

# View detailed logs
./docker-logs.sh | grep DEBUG
```

## 🔄 Updates

### Update Services

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

### Update Code

```bash
# In development mode, changes are automatically picked up
# In production mode, rebuild is needed
docker-compose build
docker-compose up -d
```

## 🧹 Cleanup

### Remove Everything

```bash
# Stop and remove all containers, images, and volumes
./docker-clean.sh
```

### Partial Cleanup

```bash
# Stop services
./docker-stop.sh

# Remove containers only
docker-compose rm -f

# Remove images only
docker-compose down --rmi all
```

## 📁 Project Structure

```
milagrou/
├── docker-compose.yml          # Production configuration
├── docker-compose.dev.yml      # Development configuration
├── docker-compose.override.yml # Local overrides
├── Dockerfile.api              # E-commerce API Dockerfile
├── mongo-init.js               # MongoDB initialization
├── env.docker                  # Environment template
├── .env                        # Your environment variables
├── mcp-server/                 # MCP Server
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── src/
├── python-agent/               # Python Agent
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── src/
└── docker-*.sh                 # Management scripts
```

## 🚀 Production Deployment

### Using Docker Compose

```bash
# Production deployment
docker-compose -f docker-compose.yml up -d
```

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml ecommerce-ai
```

### Using Kubernetes

```bash
# Convert to Kubernetes manifests
kompose convert

# Apply to cluster
kubectl apply -f .
```

## 📞 Support

For issues and questions:

1. Check the troubleshooting section
2. Run `./docker-test.sh` for diagnostics
3. Check logs with `./docker-logs.sh`
4. Create an issue with detailed information

## 📄 License

MIT License
