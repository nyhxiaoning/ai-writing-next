import nodemailer from 'nodemailer';

// 邮件配置
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * 发送重置密码邮件
 */
export async function sendResetPasswordEmail(email: string, resetToken: string, locale: string = 'zh') {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/reset-password?token=${resetToken}`;
  
  const emailContent = {
    zh: {
      subject: '重置密码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>重置密码</h2>
          <p>您好，</p>
          <p>我们收到了您重置密码的请求。请点击下面的链接来重置您的密码：</p>
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">重置密码</a>
          <p>此链接将在24小时后过期。</p>
          <p>如果您没有请求重置密码，请忽略此邮件。</p>
          <p>谢谢！</p>
        </div>
      `
    },
    en: {
      subject: 'Reset Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Password</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Please click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <p>Thank you!</p>
        </div>
      `
    }
  };

  const content = emailContent[locale as keyof typeof emailContent] || emailContent.zh;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@example.com',
    to: email,
    subject: content.subject,
    html: content.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('发送邮件失败:', error);
    return false;
  }
}

/**
 * 发送欢迎邮件
 */
export async function sendWelcomeEmail(email: string, name: string, locale: string = 'zh') {
  const emailContent = {
    zh: {
      subject: '欢迎注册',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>欢迎加入我们！</h2>
          <p>亲爱的 ${name}，</p>
          <p>感谢您注册我们的服务！您的账户已经创建成功。</p>
          <p>现在您可以开始使用我们的服务了。</p>
          <p>如果您有任何问题，请随时联系我们。</p>
          <p>祝您使用愉快！</p>
        </div>
      `
    },
    en: {
      subject: 'Welcome to Our Service',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome!</h2>
          <p>Dear ${name},</p>
          <p>Thank you for registering with our service! Your account has been created successfully.</p>
          <p>You can now start using our service.</p>
          <p>If you have any questions, please feel free to contact us.</p>
          <p>Enjoy using our service!</p>
        </div>
      `
    }
  };

  const content = emailContent[locale as keyof typeof emailContent] || emailContent.zh;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@example.com',
    to: email,
    subject: content.subject,
    html: content.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('发送欢迎邮件失败:', error);
    return false;
  }
}