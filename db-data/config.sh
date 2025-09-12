#!/bin/bash

# 数据库配置脚本
# 用于在不同环境间切换数据库配置

# 环境配置
ENV=${1:-"local"}

case $ENV in
    "local")
        echo "使用本地环境配置"
        export DB_HOST="localhost"
        export DB_USER="root"
        export DB_PASSWORD="duisdui@123"
        export DB_NAME="pd"
        export DB_PORT="3306"
        ;;
    "dev")
        echo "使用开发环境配置"
        export DB_HOST="dev-server.example.com"
        export DB_USER="dev_user"
        export DB_PASSWORD="dev_password"
        export DB_NAME="pd_dev"
        export DB_PORT="3306"
        ;;
    "prod")
        echo "使用生产环境配置"
        export DB_HOST="prod-server.example.com"
        export DB_USER="prod_user"
        export DB_PASSWORD="prod_password"
        export DB_NAME="pd_prod"
        export DB_PORT="3306"
        ;;
    *)
        echo "未知环境: $ENV"
        echo "可用环境: local, dev, prod"
        echo "使用方法: source config.sh [环境名]"
        return 1
        ;;
esac

echo "数据库配置:"
echo "  主机: $DB_HOST"
echo "  端口: $DB_PORT"
echo "  数据库: $DB_NAME"
echo "  用户: $DB_USER"
