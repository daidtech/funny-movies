# Development Dockerfile for Next.js frontend
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* yarn.lock* ./
RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "run", "dev"]
