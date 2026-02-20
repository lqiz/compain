# Zeabur Dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装 pnpm 和全局 nest CLI
RUN npm install -g pnpm @nestjs/cli

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./
COPY server/package.json ./server/

# 安装所有依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 切换到 server 目录
WORKDIR /app/server

# 构建后端（使用全局 nest CLI）
RUN nest build

# 切换回根目录
WORKDIR /app

# 只保留生产依赖
RUN pnpm install --prod --frozen-lockfile

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server/dist/main.js"]
