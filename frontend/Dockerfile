# frontend/Dockerfile

# ステージ1: ビルド環境
FROM node:18-alpine AS build
WORKDIR /app
# ↓↓↓ パスを修正 ↓↓↓
COPY frontend/project/package.json frontend/project/package-lock.json ./
RUN npm install
# ↓↓↓ パスを修正 ↓↓↓
COPY frontend/project/ ./
RUN npm run build

# ステージ2: 本番環境
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist /app/dist

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-p", "3000"]