#!/usr/bin/env bash
# remove_all_definer.sh
# 直接删除 pd 库中所有对象里包含 root@... 的 DEFINER（会 DROP+CREATE 重建）
# 使用方法：保存为文件 -> chmod +x remove_all_definer.sh -> ./remove_all_definer.sh
set -euo pipefail

HOST='pd-db-new.cgbiaakssebs.us-east-1.rds.amazonaws.com'
PORT=3306
USER='henrycao'
DB='pd'

echo "将要对 $HOST:$PORT 数据库 $DB 去除所有 DEFINER（root@...）。"
read -s -p "请输入 MySQL 密码（henrycao）： " PASS
echo
# 在当前 bash 会话内导出密码，避免 history expansion 问题
export MYSQL_PWD="$(printf '%s' "$PASS")"

# 简单 helper：在服务器上执行 SQL 并返回行（不带表头）
run_sql() {
  mysql -h "$HOST" -P "$PORT" -u "$USER" -sN -e "$1"
}

# 1) 处理 VIEWS
echo "处理 VIEWS..."
views=$(run_sql "SELECT TABLE_NAME FROM information_schema.VIEWS WHERE TABLE_SCHEMA='${DB}' AND DEFINER LIKE '%root%';")
if [ -n "$views" ]; then
  while IFS= read -r vname; do
    [ -z "$vname" ] && continue
    echo "  -> view: $vname"
    # 获取 SHOW CREATE VIEW 的第2列（CREATE 语句）
    create_sql=$(mysql -h "$HOST" -P "$PORT" -u "$USER" -sN -e "SHOW CREATE VIEW \`${DB}\`.\`${vname}\`" | sed -n '2p')
    if [ -z "$create_sql" ]; then
      echo "     WARN: 获取 CREATE VIEW 失败：$vname, 跳过"
      continue
    fi
    # 删除 DEFINER=... 字段（支持 `...` 与 '...' 形式）
    fixed=$(printf '%s\n' "$create_sql" | perl -0777 -pe "s/DEFINER=(?:\`[^\\\`]+\`@\\\`[^\\\`]+\`|'[^']+'@'[^']+')//g")
    # 执行 DROP + CREATE
    sqlfile=$(mktemp /tmp/_fixview.XXXX.sql)
    cat >"$sqlfile" <<SQL
DROP VIEW IF EXISTS \`${DB}\`.\`${vname}\`;
$fixed;
SQL
    if ! mysql -h "$HOST" -P "$PORT" -u "$USER" "$DB" < "$sqlfile"; then
      echo "     ERROR: 重建 view $vname 失败"
      rm -f "$sqlfile"
      exit 1
    fi
    rm -f "$sqlfile"
  done <<< "$views"
else
  echo "  无符合条件的 view"
fi

# 2) 处理 TRIGGERS
echo "处理 TRIGGERS..."
trigs=$(run_sql "SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA='${DB}' AND DEFINER LIKE '%root%';")
if [ -n "$trigs" ]; then
  while IFS= read -r tname; do
    [ -z "$tname" ] && continue
    echo "  -> trigger: $tname"
    create_sql=$(mysql -h "$HOST" -P "$PORT" -u "$USER" -sN -e "SHOW CREATE TRIGGER \`${DB}\`.\`${tname}\`" | sed -n '2p')
    if [ -z "$create_sql" ]; then
      echo "     WARN: 获取 CREATE TRIGGER 失败：$tname, 跳过"
      continue
    fi
    fixed=$(printf '%s\n' "$create_sql" | perl -0777 -pe "s/DEFINER=(?:\`[^\\\`]+\`@\\\`[^\\\`]+\`|'[^']+'@'[^']+')//g")
    sqlfile=$(mktemp /tmp/_fixtrig.XXXX.sql)
    cat >"$sqlfile" <<SQL
DELIMITER $$
DROP TRIGGER IF EXISTS \`${DB}\`.\`${tname}\`$$
$fixed$$
DELIMITER ;
SQL
    if ! mysql -h "$HOST" -P "$PORT" -u "$USER" "$DB" < "$sqlfile"; then
      echo "     ERROR: 重建 trigger $tname 失败"
      rm -f "$sqlfile"
      exit 1
    fi
    rm -f "$sqlfile"
  done <<< "$trigs"
else
  echo "  无符合条件的 trigger"
fi

# 3) 处理 ROUTINES（PROCEDURE / FUNCTION）
echo "处理 ROUTINES (PROCEDURE/FUNCTION)..."
routines=$(run_sql "SELECT ROUTINE_NAME,ROUTINE_TYPE FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA='${DB}' AND DEFINER LIKE '%root%';")
if [ -n "$routines" ]; then
  while IFS=$'\t' read -r rname rtype; do
    [ -z "$rname" ] && continue
    echo "  -> routine: $rname (type=$rtype)"
    if [ "$rtype" = "PROCEDURE" ]; then
      create_sql=$(mysql -h "$HOST" -P "$PORT" -u "$USER" -sN -e "SHOW CREATE PROCEDURE \`${DB}\`.\`${rname}\`" | awk -F'\t' '{ \$1=\"\"; sub(/^\t/,\"\"); print }')
    else
      create_sql=$(mysql -h "$HOST" -P "$PORT" -u "$USER" -sN -e "SHOW CREATE FUNCTION \`${DB}\`.\`${rname}\`" | awk -F'\t' '{ \$1=\"\"; sub(/^\t/,\"\"); print }')
    fi
    if [ -z "$create_sql" ]; then
      echo "     WARN: 无法获取 CREATE for $rtype $rname, 跳过"
      continue
    fi
    fixed=$(printf '%s\n' "$create_sql" | perl -0777 -pe "s/DEFINER=(?:\`[^\\\`]+\`@\\\`[^\\\`]+\`|'[^']+'@'[^']+')//g")
    sqlfile=$(mktemp /tmp/_fixroutine.XXXX.sql)
    cat >"$sqlfile" <<SQL
DELIMITER $$
DROP $rtype IF EXISTS \`${DB}\`.\`${rname}\`$$
$fixed$$
DELIMITER ;
SQL
    if ! mysql -h "$HOST" -P "$PORT" -u "$USER" "$DB" < "$sqlfile"; then
      echo "     ERROR: 重建 $rtype $rname 失败"
      rm -f "$sqlfile"
      exit 1
    fi
    rm -f "$sqlfile"
  done <<< "$routines"
else
  echo "  无符合条件的 routine"
fi

# 4) 最终验证
echo "验证剩余包含 root 的对象（如果没有输出则全部已清除）..."
mysql -h "$HOST" -P "$PORT" -u "$USER" -e "
SELECT 'TRIGGERS',TRIGGER_SCHEMA,TRIGGER_NAME,DEFINER FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA='${DB}' AND DEFINER LIKE '%root%';
SELECT 'ROUTINES',ROUTINE_SCHEMA,ROUTINE_NAME,DEFINER FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA='${DB}' AND DEFINER LIKE '%root%';
SELECT 'VIEWS',TABLE_SCHEMA,TABLE_NAME,DEFINER FROM information_schema.VIEWS WHERE TABLE_SCHEMA='${DB}' AND DEFINER LIKE '%root%';
"

echo "完成。"
unset MYSQL_PWD
