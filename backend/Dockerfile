# Use lightweight Node.js image with specific version (better-sqlite3 requires 24.x)
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Install build dependencies for better-sqlite3 BEFORE npm install
RUN apk add --no-cache sqlite python3 make g++

# Copy package.json for npm install
COPY package*.json ./
# package-lock.json ./

# Install dependencies (including better-sqlite3)
RUN npm config list
RUN npm install --verbose --no-optional

#### DATABASE ####

# Create directory for Docker volume mount point
RUN npm cache clean --force
RUN mkdir -p /app/database

# Set proper permissions for database directory
COPY dump.sql ./
RUN sqlite3 ./database/transcendence.db < dump.sql
RUN chown -R node:node /app/database

#### BACKEND ####
# Copy TypeScript source files
COPY src/ ./src/
COPY tsconfig.json ./

# Build TypeScript to JavaScript
RUN npm run build

# Expose port 3000 for API
EXPOSE 3000

# upload dir
RUN mkdir -p /app/uploads/avatars
RUN chown -R node:node /app/uploads
RUN chmod 755 /app/uploads/avatars

USER node
# Start the compiled JavaScript server
CMD ["npm", "start"]
