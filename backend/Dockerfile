FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN npm ci --omit=dev

COPY backend/ backend/

ENV NODE_ENV=development
ENV PORT=3001

EXPOSE 3001

CMD ["node", "backend/index.js"]