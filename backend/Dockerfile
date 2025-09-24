# Use lightweight Node.js image
FROM node:alpine

# Set working directory
WORKDIR /app

# Copy package.json for npm install
COPY package.json ./

# Install dependencies (including TypeScript)
RUN npm install

# Copy TypeScript source files
COPY src/ ./src/
COPY tsconfig.json ./

# Build TypeScript to JavaScript
RUN npm run build

# Expose port 3000 for API
EXPOSE 3000

# Start the compiled JavaScript server
CMD ["npm", "start"]