FROM node:24-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
RUN npm i -D typescript @types/node
RUN npm install --save-dev @tsconfig/node24
COPY . .
EXPOSE 8080
CMD ["node", "src/server.ts"]