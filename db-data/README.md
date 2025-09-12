# 数据库迁移工具

这个目录包含了用于导出和导入pd数据库的脚本和文件。

## 文件说明

- `export-database.sh` - 数据库导出脚本
- `import-database.sh` - 数据库导入脚本
- `pd_database_latest.sql` - 最新的完整数据库备份（结构+数据）
- `pd_schema_latest.sql` - 最新的数据库结构备份
- `pd_data_latest.sql` - 最新的数据备份

## 使用方法

### 1. 导出数据库（在源环境执行）

```bash
# 给脚本执行权限
chmod +x export-database.sh

# 执行导出
./export-database.sh
```

### 2. 导入数据库（在目标环境执行）

```bash
# 给脚本执行权限
chmod +x import-database.sh

# 修改目标数据库配置（编辑脚本中的数据库连接参数）
# DB_HOST="localhost"
# DB_USER="root"
# DB_PASSWORD="your_password"
# DB_NAME="pd"
# DB_PORT="3306"

# 执行导入
./import-database.sh
```

## 配置说明

### 导出脚本配置
在 `export-database.sh` 中修改以下参数：
```bash
DB_HOST="localhost"        # 源数据库主机
DB_USER="root"            # 源数据库用户名
DB_PASSWORD="duisdui@123" # 源数据库密码
DB_NAME="pd"              # 源数据库名
DB_PORT="3306"            # 源数据库端口
```

### 导入脚本配置
在 `import-database.sh` 中修改以下参数：
```bash
DB_HOST="localhost"        # 目标数据库主机
DB_USER="root"            # 目标数据库用户名
DB_PASSWORD="your_password" # 目标数据库密码
DB_NAME="pd"              # 目标数据库名
DB_PORT="3306"            # 目标数据库端口
```

## 导入选项

1. **完整导入** - 一次性导入结构和数据（推荐）
2. **分步导入** - 先导入结构，再导入数据
3. **仅导入结构** - 只创建表结构，不导入数据
4. **仅导入数据** - 只导入数据，需要先有表结构

## 注意事项

1. 确保目标环境已安装MySQL客户端工具
2. 确保目标数据库用户有足够的权限
3. 导入前建议备份目标数据库
4. 如果目标数据库已存在，导入可能会覆盖现有数据

## 故障排除

### 权限问题
```bash
# 确保脚本有执行权限
chmod +x *.sh
```

### 连接问题
- 检查数据库连接参数
- 确保数据库服务正在运行
- 检查防火墙设置

### 数据问题
- 检查源数据库是否正常
- 验证导出的SQL文件是否完整
- 查看MySQL错误日志
