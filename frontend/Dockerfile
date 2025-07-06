FROM node:18-alpine AS build
WORKDIR /app
COPY frontend/project/package.json ./
RUN npm install
COPY frontend/project/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html