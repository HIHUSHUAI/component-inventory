#!/bin/bash
# 元器件库存管理 - 本地服务启动脚本(macOS 双击运行)
# 若服务已在运行(端口 8899 被本应用占用),则直接打开浏览器,不再重复启动
cd "$(dirname "$0")"
URL="http://127.0.0.1:8899/%E5%85%83%E5%99%A8%E4%BB%B6%E5%BA%93%E5%AD%98%E7%AE%A1%E7%90%86.html"

if curl -s --max-time 2 -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null | grep -q "200"; then
  echo "本地服务已在运行,直接打开: $URL"
  open "$URL" 2>/dev/null
  exit 0
fi

echo "正在启动元器件库存管理本地服务(端口 8899)..."
echo "启动后请在浏览器打开: $URL"
echo "按 Ctrl+C 停止服务。"
echo ""
node server.js
