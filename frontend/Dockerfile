# Build stage
FROM node:20 AS build
WORKDIR /app

# รับค่า Vite env จาก Render ตอน build
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

COPY package*.json ./
RUN npm install
COPY . .

# ตอนนี้ Vite จะเห็น VITE_BACKEND_URL ตอน build แล้ว
RUN npm run build

# Serve stage
FROM node:20
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
