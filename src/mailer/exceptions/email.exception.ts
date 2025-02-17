import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

export class EmailException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailException';
  }
}

@Injectable()
export class EmailService {
  // Inyectamos MailerService a través del constructor
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordReset(email: string, token: string) {
    try {
      // Usamos mailerService para enviar el correo
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset Your Password',
        html: `
            <h3>Reset Your Password</h3>
            <p>Click the link below to reset your password:</p>
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Reset Password</a>
            <p>This link will expire in 15 minutes.</p>
          `,
      });
    } catch (error) {
      throw new EmailException('Failed to send password reset email');
    }
  }
}
