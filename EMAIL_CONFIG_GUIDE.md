# 邮件配置指南

## 问题解决

### ✅ 已修复的问题
1. **API 调用错误**：`nodemailer.createTransporter` → `nodemailer.createTransport`
2. **配置检查**：添加了邮件配置完整性检查
3. **开发友好**：邮件未配置时不会报错，而是在控制台显示日志

## 邮件配置选项

### 选项1：完全禁用邮件功能（推荐用于开发）
当前配置已经支持邮件功能的优雅降级：
- 如果邮件配置不完整，系统会自动跳过邮件发送
- 在控制台显示邮件内容和重置链接
- 注册和密码重置功能正常工作

### 选项2：配置真实邮件服务

#### Gmail 配置
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"  # 需要开启两步验证并生成应用密码
SMTP_FROM="noreply@yourapp.com"
```

#### QQ 邮箱配置
```env
SMTP_HOST="smtp.qq.com"
SMTP_PORT="587"
SMTP_USER="your-email@qq.com"
SMTP_PASS="your-authorization-code"  # QQ邮箱授权码
SMTP_FROM="noreply@yourapp.com"
```

#### 163 邮箱配置
```env
SMTP_HOST="smtp.163.com"
SMTP_PORT="587"
SMTP_USER="your-email@163.com"
SMTP_PASS="your-authorization-code"  # 163邮箱授权码
SMTP_FROM="noreply@yourapp.com"
```

## 获取邮箱授权码

### Gmail
1. 开启两步验证
2. 生成应用专用密码
3. 使用应用密码作为 `SMTP_PASS`

### QQ 邮箱
1. 登录 QQ 邮箱
2. 设置 → 账户 → POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务
3. 开启 SMTP 服务
4. 生成授权码

### 163 邮箱
1. 登录 163 邮箱
2. 设置 → POP3/SMTP/IMAP
3. 开启 SMTP 服务
4. 设置客户端授权密码

## 测试邮件功能

### 开发环境测试
1. 不配置邮件环境变量
2. 注册用户时查看控制台日志
3. 密码重置时查看控制台中的重置链接

### 生产环境测试
1. 配置完整的邮件环境变量
2. 注册测试用户
3. 检查邮箱是否收到欢迎邮件
4. 测试密码重置功能

## 当前状态

✅ **注册功能现在应该可以正常工作了！**

即使没有配置邮件服务，注册功能也会：
1. 成功创建用户账户
2. 生成 JWT Token
3. 设置认证状态
4. 跳转到仪表板
5. 在控制台显示邮件日志（而不是报错）

## 下一步

1. **立即测试**：访问 `/zh/auth/signup` 进行注册测试
2. **可选配置**：如需真实邮件功能，按上述指南配置邮件服务
3. **生产部署**：部署到生产环境前务必配置真实邮件服务