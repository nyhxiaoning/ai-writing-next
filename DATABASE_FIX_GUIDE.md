# 数据库修复指南 - 注册功能问题解决

## 问题诊断

注册功能失败的根本原因是：**数据库模型缺少认证相关字段**

当前 User 表只有基础字段：
- id
- name  
- email

但认证系统需要的字段缺失：
- password (密码)
- avatar (头像)
- emailVerified (邮箱验证状态)
- resetToken (重置密码令牌)
- 等等...

## 解决步骤

### 1. 更新数据库模型
已更新 `prisma/schema.prisma` 文件，添加了所有认证相关字段。

### 2. 生成并应用数据库迁移

```bash
# 生成新的迁移文件
npx prisma migrate dev --name add-auth-fields

# 如果上述命令失败，可以重置数据库（注意：会删除所有数据）
npx prisma migrate reset

# 生成 Prisma 客户端
npx prisma generate
```

### 3. 验证数据库连接

确保 `.env` 文件中的数据库连接配置正确：

```env
DATABASE_URL="mysql://henry:nyh123@localhost:3306/next-blog-pages"
```

### 4. 启动数据库服务

确保 MySQL 服务正在运行：

```bash
# macOS 使用 Homebrew 安装的 MySQL
brew services start mysql

# 或者使用系统服务
sudo systemctl start mysql
```

### 5. 测试数据库连接

```bash
# 查看数据库状态
npx prisma db push

# 查看数据库结构
npx prisma studio
```

## 常见问题解决

### 问题1: 数据库连接失败
- 检查 MySQL 服务是否启动
- 验证用户名、密码、数据库名是否正确
- 确认数据库 `next-blog-pages` 是否存在

### 问题2: 迁移失败
如果迁移失败，可以：
1. 备份重要数据
2. 删除 `prisma/migrations` 目录
3. 运行 `npx prisma migrate reset`
4. 重新生成迁移

### 问题3: Prisma 客户端错误
```bash
# 重新生成客户端
npx prisma generate
```

## 验证修复

修复完成后，注册功能应该能够：
1. 成功创建用户记录
2. 加密存储密码
3. 设置用户认证状态
4. 发送欢迎邮件（如果邮件配置正确）

## 下一步

1. 运行数据库迁移命令
2. 测试注册功能
3. 检查用户是否能成功登录
4. 验证密码重置功能