# Zeabur Dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package 文件（根目录和 server 目录）
COPY package.json pnpm-lock.yaml ./
COPY server/package.json ./server/

# 安装所有依赖（包括开发依赖，构建需要）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建后端（需要开发依赖）
# 使用 cd 确保在正确的目录执行
WORKDIR /app/server
RUN npx nest build

# 切换回根目录
WORKDIR /app

# 只保留生产依赖（减小镜像体积）
RUN pnpm install --prod --frozen-lockfile

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server/dist/main.js"]
