# Build stage
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage (serve frontend)
FROM node:18

WORKDIR /app

# ติดตั้ง serve เพื่อรัน production build
RUN npm install -g serve

# Copy build จาก stage แรก
COPY --from=build /app/dist ./dist

# Expose port (Render จะใช้ env PORT)
EXPOSE 3000

# Serve frontend
CMD ["serve", "-s", "dist", "-l", "3000"]
