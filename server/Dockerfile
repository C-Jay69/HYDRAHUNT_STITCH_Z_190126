FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production || true
COPY .. /app/host
WORKDIR /app/host/server
EXPOSE 4000
CMD ["node", "index.js"]
