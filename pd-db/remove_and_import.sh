#!/usr/bin/env bash
# remove_and_import_mac_fix.sh
# 将本地 pd 导出 -> 移除所有 DEFINER -> 导入到远端（兼容 macOS，修复 $WORKDIR? 报错）
set -euo pipefail

# ====== 配置区（可通过环境变量覆盖） ======
LOCAL_HOST=${LOCAL_HOST:-localhost}
LOCAL_PORT=${LOCAL_PORT:-3306}
LOCAL_USER=${LOCAL_USER:-root}
LOCAL_PASS=${LOCAL_PASS:-Shein@123}   # 如有不同请覆盖或运行前设置环境变量
LOCAL_DB=${LOCAL_DB:-pd}

REMOTE_HOST=${REMOTE_HOST:-pd-db-new.cgbiaakssebs.us-east-1.rds.amazonaws.com}
REMOTE_PORT=${REMOTE_PORT:-3306}
REMOTE_USER=${REMOTE_USER:-henrycao}
REMOTE_PASS=${REMOTE_PASS:-'Pearl#89$Hc!'}
REMOTE_DB=${REMOTE_DB:-pd}
# ============================================

WORKDIR="$(mktemp -d /tmp/pd_migrate.XXXX)"
DUMP_RAW="$WORKDIR/pd.sql"
DUMP_CLEAN="$WORKDIR/pd.clean.sql"

# 安全输出 WORKDIR（使用默认值避免 set -u 报错）
echo "工作目录：${WORKDIR:-}"

echo "步骤1：从本地导出数据库 $LOCAL_DB ..."
export MYSQL_PWD="$(printf '%s' "$LOCAL_PASS")"
mysqldump -h "$LOCAL_HOST" -P "$LOCAL_PORT" -u "$LOCAL_USER" \
  --single-transaction --quick --routines --triggers --events --databases "$LOCAL_DB" > "$DUMP_RAW"
unset MYSQL_PWD
echo "本地导出完成：$DUMP_RAW"

echo "步骤2：移除所有 DEFINER（生成清理文件）..."
perl -0777 -pe "s/DEFINER=(?:\`[^\\\`]+\`@\\\`[^\\\`]+\`|'[^']+'@'[^']+')//g" "$DUMP_RAW" > "$DUMP_CLEAN"

# 获取文件大小（兼容 macOS 和 Linux）
SIZE_BYTES="$(wc -c < "$DUMP_CLEAN" | tr -d '[:space:]')"
echo "生成清理后的 SQL：$DUMP_CLEAN (大小 ${SIZE_BYTES} bytes)"

echo "步骤3：尝试在远端 DROP + CREATE 数据库（若无权限，会输出错误但脚本将继续尝试导入）..."
export MYSQL_PWD="$(printf '%s' "$REMOTE_PASS")"
set +e
mysql -h "$REMOTE_HOST" -P "$REMOTE_PORT" -u "$REMOTE_USER" -e "DROP DATABASE IF EXISTS \`$REMOTE_DB\`; CREATE DATABASE \`$REMOTE_DB\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
RC_DROP=$?
set -e
if [ $RC_DROP -ne 0 ]; then
  echo "警告：远端 DROP/CREATE 数据库失败（返回码 $RC_DROP）。可能是权限不足。脚本仍将尝试导入到现有数据库。"
else
  echo "远端数据库已重建：$REMOTE_DB"
fi

echo "步骤4：导入清理后的 SQL 到远端（开始）..."
mysql -h "$REMOTE_HOST" -P "$REMOTE_PORT" -u "$REMOTE_USER" "$REMOTE_DB" < "$DUMP_CLEAN"
echo "导入完成。"

unset MYSQL_PWD

echo "步骤5：验证是否仍存在 root DEFINER（0 表示已清除）..."
export MYSQL_PWD="$(printf '%s' "$REMOTE_PASS")"
mysql -h "$REMOTE_HOST" -P "$REMOTE_PORT" -u "$REMOTE_USER" -e \
"SELECT 'VIEWS',COUNT(*) FROM information_schema.VIEWS WHERE TABLE_SCHEMA='$REMOTE_DB' AND DEFINER LIKE '%root%';
 SELECT 'TRIGGERS',COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA='$REMOTE_DB' AND DEFINER LIKE '%root%';
 SELECT 'ROUTINES',COUNT(*) FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA='$REMOTE_DB' AND DEFINER LIKE '%root%';"
unset MYSQL_PWD

echo "完成。工作文件保留在：${WORKDIR:-}。若确认无问题请手动删除该目录。"
