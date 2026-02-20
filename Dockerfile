# Zeabur Dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./

# 安装所有依赖（包括开发依赖，构建需要）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建后端（需要开发依赖）
RUN pnpm build:server

# 只保留生产依赖（减小镜像体积）
RUN pnpm prune --prod

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server/dist/main.js"]
