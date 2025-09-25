# Use Node.js image
FROM node:alpine

# Set working directory
WORKDIR /app

# Copy package.json for npm install
COPY package.json ./

# Install dependencies
RUN npm install

# Copy all frontend files
COPY . .

# Build CSS with TailwindCSS
RUN npm run build

# Expose port 80
EXPOSE 80

# Start simple HTTP server
CMD ["npm", "start"]