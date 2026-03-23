#!/bin/bash

# Antigravity Remote - Docker Management Script
# Usage: ./docker-manage.sh [command] [options]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

COLOR_BLUE='\033[0;34m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${COLOR_BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${COLOR_GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${COLOR_YELLOW}ℹ $1${NC}"
}

print_error() {
    echo -e "${COLOR_RED}✗ $1${NC}"
}

case "${1:-help}" in
    up)
        print_header "Starting Antigravity Remote"
        docker-compose up -d
        print_success "Services started!"
        echo ""
        print_info "URLs:"
        echo "  Client: http://localhost:5173"
        echo "  API:    https://localhost:3333"
        echo "  Ollama: http://localhost:11434"
        echo ""
        print_info "Waiting for Ollama to initialize (this may take 1-2 minutes)..."
        
        # Wait for Ollama to be ready
        for i in {1..120}; do
            if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
                print_success "Ollama is ready!"
                break
            fi
            echo -n "."
            sleep 1
        done
        ;;
        
    down)
        print_header "Stopping services"
        docker-compose down
        print_success "Services stopped"
        ;;
        
    restart)
        print_header "Restarting services"
        docker-compose restart
        print_success "Services restarted"
        ;;
        
    logs)
        print_header "Showing logs"
        docker-compose logs -f "${2:-}"
        ;;
        
    clean)
        print_header "Cleaning up"
        docker-compose down -v
        docker system prune -f
        print_success "Cleanup complete"
        ;;
        
    build)
        print_header "Building images"
        docker-compose build --no-cache
        print_success "Build complete"
        ;;
        
    shell)
        print_header "Opening shell in antigravity-remote"
        docker-compose exec antigravity-remote sh
        ;;
        
    status)
        print_header "Service status"
        docker-compose ps
        ;;
        
    test)
        print_header "Testing connection"
        
        echo "Testing API:"
        curl -k -s https://localhost:3333/ | head -5
        echo ""
        
        echo "Testing Ollama:"
        curl -s http://localhost:11434/api/tags | head -5
        echo ""
        
        print_success "Tests complete"
        ;;
        
    push)
        REGISTRY="${2:-}"
        if [ -z "$REGISTRY" ]; then
            print_error "Please provide registry. Usage: ./docker-manage.sh push <registry>/antigravity-remote:latest"
            exit 1
        fi
        print_header "Pushing to $REGISTRY"
        docker build -t "$REGISTRY" .
        docker push "$REGISTRY"
        print_success "Push complete"
        ;;
        
    *)
        echo "Antigravity Remote - Docker Management"
        echo ""
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  up              Start all services (Ollama + Antigravity Remote)"
        echo "  down            Stop all services"
        echo "  restart         Restart services"
        echo "  logs [service]  Show logs (default: all)"
        echo "  status          Show service status"
        echo "  build           Rebuild images"
        echo "  clean           Stop services and remove volumes"
        echo "  shell           Open shell in container"
        echo "  test            Test connections to services"
        echo "  push <registry> Build and push to registry"
        echo "  help            Show this message"
        echo ""
        echo "Examples:"
        echo "  $0 up"
        echo "  $0 logs antigravity-remote"
        echo "  $0 push docker.io/myuser/antigravity-remote:latest"
        ;;
esac
