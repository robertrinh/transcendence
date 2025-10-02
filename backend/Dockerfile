# Use lightweight Node.js image
FROM node:alpine

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package.json for npm install
COPY package.json ./

# Install dependencies (including better-sqlite3)
RUN npm install

# Copy TypeScript source files
COPY src/ ./src/
COPY tsconfig.json ./

# Create directory for Docker volume mount point
RUN mkdir -p /app/database

# Build TypeScript to JavaScript
RUN npm run build

# Set proper permissions for database directory
RUN chown -R node:node /app/database
USER node

# Expose port 3000 for API
EXPOSE 3000

# Start the compiled JavaScript server
CMD ["npm", "start"]