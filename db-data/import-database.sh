#!/bin/bash

# 数据库导入脚本
# 用于在新环境中导入pd数据库

# 数据库配置 - 请根据目标环境修改这些参数
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD="duisdui@123"
DB_NAME="pd"
DB_PORT="3306"

# 脚本目录
SCRIPT_DIR="./db-data"

echo "开始导入数据库到: $DB_HOST:$DB_PORT/$DB_NAME"
echo "脚本目录: $SCRIPT_DIR"

# 检查必要的SQL文件是否存在
if [ ! -f "$SCRIPT_DIR/pd_database_latest.sql" ]; then
    echo "❌ 找不到 pd_database_latest.sql 文件"
    echo "请先运行 export-database.sh 导出数据"
    exit 1
fi

# 询问用户选择导入方式
echo ""
echo "请选择导入方式:"
echo "1) 完整导入 (结构+数据) - 推荐"
echo "2) 分步导入 (先结构，后数据)"
echo "3) 仅导入结构"
echo "4) 仅导入数据"
read -p "请输入选择 (1-4): " choice

case $choice in
    1)
        echo "正在执行完整导入..."
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" < "$SCRIPT_DIR/pd_database_latest.sql"
        if [ $? -eq 0 ]; then
            echo "✅ 完整导入成功"
        else
            echo "❌ 完整导入失败"
            exit 1
        fi
        ;;
    2)
        echo "正在导入数据库结构..."
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" < "$SCRIPT_DIR/pd_schema_latest.sql"
        if [ $? -eq 0 ]; then
            echo "✅ 结构导入成功"
        else
            echo "❌ 结构导入失败"
            exit 1
        fi
        
        echo "正在导入数据..."
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" < "$SCRIPT_DIR/pd_data_latest.sql"
        if [ $? -eq 0 ]; then
            echo "✅ 数据导入成功"
        else
            echo "❌ 数据导入失败"
            exit 1
        fi
        ;;
    3)
        echo "正在导入数据库结构..."
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" < "$SCRIPT_DIR/pd_schema_latest.sql"
        if [ $? -eq 0 ]; then
            echo "✅ 结构导入成功"
        else
            echo "❌ 结构导入失败"
            exit 1
        fi
        ;;
    4)
        echo "正在导入数据..."
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" < "$SCRIPT_DIR/pd_data_latest.sql"
        if [ $? -eq 0 ]; then
            echo "✅ 数据导入成功"
        else
            echo "❌ 数据导入失败"
            exit 1
        fi
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🎉 数据库导入完成！"
echo "📊 数据库: $DB_NAME"
echo "🖥️  主机: $DB_HOST:$DB_PORT"
echo ""
echo "💡 下一步:"
echo "1. 检查数据库连接配置"
echo "2. 启动应用程序"
echo "3. 验证数据完整性"
