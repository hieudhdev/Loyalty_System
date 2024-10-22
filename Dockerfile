# Sử dụng Node.js base image
FROM node:18-alpine

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy package.json và package-lock.json vào thư mục làm việc
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install --only=production

# Copy toàn bộ code vào container
COPY . .

# Build ứng dụng NestJS (nếu sử dụng TypeScript)
RUN npm run build

# Khai báo port ứng dụng sẽ chạy
EXPOSE 3000

# Lệnh khởi động ứng dụng
CMD ["npm", "run", "start:prod"]
