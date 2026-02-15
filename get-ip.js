#!/usr/bin/env node

/**
 * 获取本机局域网 IP 地址
 * 用于真机测试配置
 */

const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // 跳过内部地址和 IPv6
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return '127.0.0.1';
}

const ip = getLocalIP();

console.log('='.repeat(60));
console.log('📱 真机测试配置助手');
console.log('='.repeat(60));
console.log('');
console.log('📍 你的局域网 IP:', ip);
console.log('');
console.log('📝 请按以下步骤操作：');
console.log('');
console.log('1. 编辑 .env.local 文件，修改为：');
console.log(`   PROJECT_DOMAIN=http://${ip}:3000`);
console.log('');
console.log('2. 重启开发服务：');
console.log('   cd /workspace/projects && coze dev');
console.log('');
console.log('3. 在微信开发者工具中：');
console.log('   - 详情 → 本地设置');
console.log('   - 勾选「不校验合法域名」');
console.log('');
console.log('4. 点击「预览」，扫码真机测试');
console.log('');
console.log('='.repeat(60));
console.log('🔗 验证地址：');
console.log(`   http://${ip}:3000/api/video/list`);
console.log('='.repeat(60));

// 同时输出到 .env.example
const fs = require('fs');
const exampleContent = `# 真机测试环境配置示例
# 将此文件复制为 .env.local 并修改为你的实际 IP
# 运行 node get-ip.js 查看你的局域网 IP

PROJECT_DOMAIN=http://${ip}:3000
`;

fs.writeFileSync('/workspace/projects/.env.example', exampleContent);
console.log('');
console.log('✅ 已生成 .env.example 配置文件模板');
