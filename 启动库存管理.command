#!/bin/bash
# 元器件库存管理 - 本地服务启动脚本(macOS 双击运行)
cd "$(dirname "$0")"
echo "正在启动元器件库存管理本地服务(端口 8899)..."
echo "启动后请在浏览器打开: http://127.0.0.1:8899/元器件库存管理.html"
echo "按 Ctrl+C 停止服务。"
echo ""
node server.js
