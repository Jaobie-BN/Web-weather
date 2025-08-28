# ใช้ Node.js LTS
FROM node:18

# กำหนด working directory
WORKDIR /app

# Copy package.json และติดตั้ง dependencies ก่อน (cache layer)
COPY package*.json ./
RUN npm install --production

# Copy source code ทั้งหมด
COPY . .

# Expose port (Render จะใช้ env PORT)
EXPOSE 4000

# Start app
CMD ["node", "index.js"]
