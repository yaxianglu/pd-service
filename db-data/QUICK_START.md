# 快速使用指南

## 🚀 快速开始

### 1. 导出数据（在源环境）
```bash
cd pd-service/db-data
./export-database.sh
```

### 2. 导入数据（在目标环境）
```bash
cd pd-service/db-data
./import-database.sh
```

## 📁 文件说明

| 文件名 | 大小 | 说明 |
|--------|------|------|
| `pd_database_latest.sql` | ~302MB | 完整数据库（结构+数据） |
| `pd_schema_latest.sql` | ~85KB | 仅数据库结构 |
| `pd_data_latest.sql` | ~302MB | 仅数据 |

## 🔧 配置修改

### 修改目标数据库配置
编辑 `import-database.sh` 文件中的数据库连接参数：

```bash
# 目标数据库配置
DB_HOST="localhost"           # 目标数据库主机
DB_USER="root"               # 目标数据库用户名  
DB_PASSWORD="your_password"  # 目标数据库密码
DB_NAME="pd"                 # 目标数据库名
DB_PORT="3306"               # 目标数据库端口
```

### 使用环境配置
```bash
# 加载本地环境配置
source config.sh local

# 加载开发环境配置  
source config.sh dev

# 加载生产环境配置
source config.sh prod
```

## ⚡ 常用命令

```bash
# 查看文件大小
ls -lh *.sql

# 查看数据库结构
head -50 pd_schema_latest.sql

# 查看数据内容
head -50 pd_data_latest.sql

# 检查MySQL连接
mysql -h localhost -u root -p -e "SHOW DATABASES;"
```

## 🛠️ 故障排除

### 权限问题
```bash
chmod +x *.sh
```

### 连接失败
1. 检查MySQL服务是否运行
2. 验证用户名密码
3. 检查防火墙设置

### 导入失败
1. 确保目标数据库存在
2. 检查用户权限
3. 查看MySQL错误日志

## 📋 检查清单

- [ ] 源数据库导出成功
- [ ] SQL文件大小正常（~302MB）
- [ ] 目标环境MySQL服务运行
- [ ] 目标数据库用户权限正确
- [ ] 导入脚本配置正确
- [ ] 数据导入成功
- [ ] 应用程序连接正常
