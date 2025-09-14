FROM node:24-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npx @tailwindcss/cli -i ./static/stylesheet.css -o ./static/output.css
EXPOSE 8080
RUN npm run build
CMD ["npm", "run", "start"]