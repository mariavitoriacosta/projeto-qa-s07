FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN npm ci

COPY frontend/ frontend/

RUN npm run build -w frontend

FROM nginx:1.27-alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80