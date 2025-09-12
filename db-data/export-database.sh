#!/bin/bash

# 数据库导出脚本
# 用于导出localhost MySQL中的pd数据库的所有数据结构和数据

# 数据库配置
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD="duisdui@123"
DB_NAME="pd"
DB_PORT="3306"

# 输出目录
OUTPUT_DIR="./db-data"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

echo "开始导出数据库: $DB_NAME"
echo "时间戳: $TIMESTAMP"

# 1. 导出完整的数据库结构和数据
echo "正在导出完整数据库..."
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --add-drop-database \
  --create-options \
  --disable-keys \
  --extended-insert \
  --quick \
  --lock-tables=false \
  --set-gtid-purged=OFF \
  "$DB_NAME" > "$OUTPUT_DIR/pd_database_full_$TIMESTAMP.sql"

if [ $? -eq 0 ]; then
    echo "✅ 完整数据库导出成功: $OUTPUT_DIR/pd_database_full_$TIMESTAMP.sql"
else
    echo "❌ 完整数据库导出失败"
    exit 1
fi

# 2. 只导出数据结构（不包含数据）
echo "正在导出数据结构..."
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" \
  --no-data \
  --routines \
  --triggers \
  --events \
  --add-drop-database \
  --create-options \
  --set-gtid-purged=OFF \
  "$DB_NAME" > "$OUTPUT_DIR/pd_schema_only_$TIMESTAMP.sql"

if [ $? -eq 0 ]; then
    echo "✅ 数据结构导出成功: $OUTPUT_DIR/pd_schema_only_$TIMESTAMP.sql"
else
    echo "❌ 数据结构导出失败"
    exit 1
fi

# 3. 只导出数据（不包含结构）
echo "正在导出数据..."
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" \
  --no-create-info \
  --single-transaction \
  --disable-keys \
  --extended-insert \
  --quick \
  --lock-tables=false \
  --set-gtid-purged=OFF \
  "$DB_NAME" > "$OUTPUT_DIR/pd_data_only_$TIMESTAMP.sql"

if [ $? -eq 0 ]; then
    echo "✅ 数据导出成功: $OUTPUT_DIR/pd_data_only_$TIMESTAMP.sql"
else
    echo "❌ 数据导出失败"
    exit 1
fi

# 4. 创建最新的符号链接
ln -sf "pd_database_full_$TIMESTAMP.sql" "$OUTPUT_DIR/pd_database_latest.sql"
ln -sf "pd_schema_only_$TIMESTAMP.sql" "$OUTPUT_DIR/pd_schema_latest.sql"
ln -sf "pd_data_only_$TIMESTAMP.sql" "$OUTPUT_DIR/pd_data_latest.sql"

echo ""
echo "🎉 数据库导出完成！"
echo "📁 输出目录: $OUTPUT_DIR"
echo "📄 完整数据库: pd_database_latest.sql"
echo "📄 仅结构: pd_schema_latest.sql"
echo "📄 仅数据: pd_data_latest.sql"
echo ""
echo "💡 使用说明:"
echo "1. 在新环境中先执行 pd_schema_latest.sql 创建表结构"
echo "2. 然后执行 pd_data_latest.sql 导入数据"
echo "3. 或者直接执行 pd_database_latest.sql 一次性完成"
