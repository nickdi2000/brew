#!/bin/bash

# BrewTokens Deployment Script
# Deploys frontend and backend to production server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SSH_KEY="/Users/nick/.ssh/id_rsa_hostinger"
SERVER="root@5.183.8.134"
FRONTEND_DEST="/opt/brewbucks/fe/dist"
BACKEND_DEST="/opt/brewbucks/be"
NGINX_DEST="/opt/brewbucks/nginx"
PM2_APP_NAME="brewbucks"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Error handling
handle_error() {
    log_error "Deployment failed at line $1"
    log_error "Command that failed: $2"
    exit 1
}

# Set up error trap
trap 'handle_error $LINENO "$BASH_COMMAND"' ERR

# Check if required tools are installed
check_dependencies() {
    log_step "Checking dependencies..."
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v rsync &> /dev/null; then
        log_error "rsync is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v ssh &> /dev/null; then
        log_error "ssh is not installed or not in PATH"
        exit 1
    fi
    
    if [ ! -f "$SSH_KEY" ]; then
        log_error "SSH key not found at $SSH_KEY"
        exit 1
    fi
    
    log_success "All dependencies are available"
}

# Test SSH connection
test_ssh_connection() {
    log_step "Testing SSH connection to server..."
    
    if ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o BatchMode=yes "$SERVER" "echo 'SSH connection successful'" 2>/dev/null; then
        log_success "SSH connection established"
    else
        log_error "Failed to connect to server via SSH"
        exit 1
    fi
}

# Build frontend
build_frontend() {
    log_step "Building frontend application..."
    
    cd fe
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        log_error "package.json not found in fe directory"
        exit 1
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        log_info "Installing frontend dependencies..."
        npm install
    fi
    
    # Run production build
    log_info "Running production build (npm run prod)..."
    npm run prod
    
    # Check if dist directory was created
    if [ ! -d "dist" ]; then
        log_error "Frontend build failed - dist directory not created"
        exit 1
    fi
    
    log_success "Frontend build completed successfully"
    cd ..
}

# Sync frontend to server
sync_frontend() {
    log_step "Syncing frontend to server..."
    
    # Create destination directory if it doesn't exist
    log_info "Creating frontend destination directory on server..."
    ssh -i "$SSH_KEY" "$SERVER" "mkdir -p $FRONTEND_DEST"
    
    # Sync frontend dist to server
    log_info "Syncing frontend dist directory..."
    rsync -avz --delete -e "ssh -i $SSH_KEY" fe/dist/ "$SERVER:$FRONTEND_DEST/"
    
    log_success "Frontend synced successfully"
}

# Sync backend to server
sync_backend() {
    log_step "Syncing backend to server..."
    
    # Create destination directory if it doesn't exist
    log_info "Creating backend destination directory on server..."
    ssh -i "$SSH_KEY" "$SERVER" "mkdir -p $BACKEND_DEST"
    
    # Sync backend to server (excluding node_modules)
    log_info "Syncing backend directory..."
    rsync -avz --delete --exclude 'node_modules' --exclude '.git' -e "ssh -i $SSH_KEY" be/ "$SERVER:$BACKEND_DEST/"
    
    log_success "Backend synced successfully"
}

# Sync nginx to server
sync_nginx() {
    log_step "Syncing nginx configuration to server..."
    
    # Create destination directory if it doesn't exist
    log_info "Creating nginx destination directory on server..."
    ssh -i "$SSH_KEY" "$SERVER" "mkdir -p $NGINX_DEST"
    
    # Sync nginx to server
    log_info "Syncing nginx directory..."
    rsync -avz --delete -e "ssh -i $SSH_KEY" nginx/ "$SERVER:$NGINX_DEST/"
    
    log_success "Nginx configuration synced successfully"
}

# Install backend dependencies on server
install_backend_dependencies() {
    log_step "Installing backend dependencies on server..."
    
    log_info "Running npm install on server..."
    ssh -i "$SSH_KEY" "$SERVER" "cd $BACKEND_DEST && npm install --production"
    
    log_success "Backend dependencies installed"
}

# Manage PM2 process
manage_pm2_process() {
    log_step "Managing PM2 process..."
    
    # Check if PM2 is installed on server
    log_info "Checking if PM2 is installed on server..."
    if ! ssh -i "$SSH_KEY" "$SERVER" "command -v pm2" &> /dev/null; then
        log_error "PM2 is not installed on the server"
        log_info "Installing PM2 globally..."
        ssh -i "$SSH_KEY" "$SERVER" "npm install -g pm2"
    fi
    
    # Check if the app is already running
    log_info "Checking if $PM2_APP_NAME is already running..."
    if ssh -i "$SSH_KEY" "$SERVER" "pm2 list | grep -q '$PM2_APP_NAME'"; then
        log_info "Restarting existing PM2 process: $PM2_APP_NAME"
        ssh -i "$SSH_KEY" "$SERVER" "pm2 restart $PM2_APP_NAME"
    else
        log_info "Starting new PM2 process: $PM2_APP_NAME"
        ssh -i "$SSH_KEY" "$SERVER" "cd $BACKEND_DEST && pm2 start app.js --name $PM2_APP_NAME"
    fi
    
    # Save PM2 configuration
    log_info "Saving PM2 configuration..."
    ssh -i "$SSH_KEY" "$SERVER" "pm2 save"
    
    log_success "PM2 process managed successfully"
}

# Prompt user for frontend build
prompt_frontend_build() {
    echo ""
    read -p "$(echo -e ${YELLOW}Do you want to build the frontend? [Y/n]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        log_info "Skipping frontend build as requested"
        return 1
    else
        log_info "Proceeding with frontend build"
        return 0
    fi
}

# Show PM2 logs
show_pm2_logs() {
    log_step "Showing PM2 logs for $PM2_APP_NAME..."
    
    log_info "Displaying recent logs (press Ctrl+C to exit)..."
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}PM2 Logs for $PM2_APP_NAME${NC}"
    echo -e "${CYAN}========================================${NC}"
    
    ssh -i "$SSH_KEY" "$SERVER" "pm2 logs $PM2_APP_NAME --lines 50"
}

# Main deployment function
main() {
    echo -e "${PURPLE}========================================${NC}"
    echo -e "${PURPLE}    BrewTokens Deployment Script${NC}"
    echo -e "${PURPLE}========================================${NC}"
    echo ""
    
    # Run deployment steps
    check_dependencies
    test_ssh_connection
    
    # Prompt for frontend build
    if prompt_frontend_build; then
        build_frontend
        sync_frontend
    else
        log_info "Skipping frontend build and sync"
    fi
    
    sync_backend
    sync_nginx
    install_backend_dependencies
    manage_pm2_process
    
    echo ""
    log_success "Deployment completed successfully!"
    echo ""
    
    # Ask if user wants to see logs
    read -p "$(echo -e ${YELLOW}Do you want to view PM2 logs? [y/N]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        show_pm2_logs
    else
        log_info "To view logs later, run: ssh -i $SSH_KEY $SERVER 'pm2 logs $PM2_APP_NAME'"
    fi
}

# Run main function
main "$@"
