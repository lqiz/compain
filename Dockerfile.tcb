# 微信云托管 Dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./

# 安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 复制源代码
COPY . .

# 构建后端
RUN pnpm build:server

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server/dist/main.js"]
