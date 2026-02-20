#!/bin/bash
backend_env=$(dirname "$BASH_SOURCE")/./backend/.env
frontend_env=$(dirname "$BASH_SOURCE")/./frontend/.env
game_env=$(dirname "$BASH_SOURCE")/./server-side-pong/.env
hostname=$(hostname)
nginx_dir=$(dirname "$BASH_SOURCE")/./frontend/nginx
backend_port=3000
frontend_port=8080
game_server_port=8081
passwd=$(openssl passwd -1 "")	
nginx_port=8443
jwt_secret=$(openssl rand -base64 32)

function create_ssl () {
	openssl req -x509 -newkey rsa:4096 -keyout $nginx_dir/nginx-selfsigned.key \
	-out $nginx_dir/nginx-selfsigned.crt -sha256 -days 3650 -nodes -subj \
	"/C=XX/ST=Noord-Holland/L=Amsterdam/O=Codam Coding College/OU=/CN=$hostname"
}

function create_htpasswd () {
	cat <<- EOF > $nginx_dir/.htpasswd
	gameserver:$passwd
	EOF
}

function create_backend_env () {
    cat <<- EOF > $backend_env
	# Backend Environment Variables
	# Copy this file to .env and fill in your actual values

	# Node Environment (development, production, test)
	NODE_ENV=development

	# Database Configuration
	# Path to SQLite database file
	DB_PATH=./database/transcendence.db

	# JWT Configuration
	# Use: openssl rand -base64 32
	JWT_SECRET=$jwt_secret

	# JWT Token Expiration Time
	# Format: 60s, 5m, 1h, 7d, etc.
	JWT_EXPIRES_IN=1h

	# Server Configuration 
	BACKEND_PORT=$backend_port
	FRONTEND_PORT=$frontend_port
	NGINX_PORT=$nginx_port
	HOST=$hostname
	EOF
}

function create_frontend_env () {
	cat <<- EOF > $frontend_env
	VITE_SERVER_HOSTNAME=$hostname
	VITE_GAME_SERVER_PORT=$game_server_port
	VITE_BACKEND_PORT=$backend_port
	VITE_FRONTEND_PORT=$frontend_port
	VITE_NGINX_PORT=$nginx_port
	EOF
}

function create_game_env () {
	cat <<- EOF > $game_env
	BACKEND_PORT=$backend_port
	
	# Password to use for the “HTTP Basic Authentication” protocol, used by the
	# game server to finish games
	HTTP_PASSWD='$passwd'

	# JWT Configuration
	# Use: openssl rand -base64 32
	JWT_SECRET=$jwt_secret
	EOF
}

if [ -f "$backend_env" ]; then
	echo "Found backend .env file"
else
	echo "Creating default backend .env..."
	create_backend_env
fi

if [ -f "$frontend_env" ]; then
	echo "Found frontend .env file"
else
	echo "Creating default frontend .env..."
	create_frontend_env
fi

if [ -f "$game_env" ]; then
	echo "Found game .env file"
else
	echo "Creating default game .env..."
	create_game_env
fi

if [ -d "$nginx_dir" ]; then
	echo "Found SSL key directory"
else
	echo "Creating SSL key directory..."
	mkdir $nginx_dir
	echo "Creating self-signed SSL certificate..."
	create_ssl
	echo "Creating htpasswd file..."
	create_htpasswd
fi
