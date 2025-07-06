FROM node:18-alpine
WORKDIR /app/project
COPY ./project/package*.json ./
RUN npm install
COPY ./project .
EXPOSE 5173
CMD ["npx", "vite", "--host"]
