# Use lightweight Node.js image
FROM node:alpine

# Set working directory
WORKDIR /app

# Copy package.json for npm install
COPY package.json package-lock.json ./

# Install dependencies (including better-sqlite3)
RUN npm install

#### DATABASE ####
# Install build dependencies for better-sqlite3
RUN apk add --no-cache sqlite python3 make g++

# Create directory for Docker volume mount point
RUN mkdir -p /app/database

# Set proper permissions for database directory
COPY dump.sql ./
RUN sqlite3 ./database/db.sqlite < dump.sql
RUN chown -R node:node /app/database

#### BACKEND ####
# Copy TypeScript source files
COPY src/ ./src/
COPY tsconfig.json ./

# Create directory for Docker volume mount point
RUN mkdir -p /app/database

# Build TypeScript to JavaScript
RUN npm run build

# Expose port 3000 for API
EXPOSE 3000

USER node
# Start the compiled JavaScript server
CMD ["npm", "start"]