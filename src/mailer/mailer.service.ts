import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordReset(email: string, token: string) {
    try {
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset Your Password',
        html: `
          <h3>Reset Your Password</h3>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">Reset Password</a>
          <p>This link will expire in 15 minutes.</p>
        `,
      });
    } catch (error) {
      throw new Error('Failed to send password reset email');
    }
  }
}
