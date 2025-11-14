import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import { EmailConfig } from './email.config';

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private emailConfig: EmailConfig;
  private templatesPath: string;

  constructor(private readonly configService: ConfigService) {
    this.emailConfig = this.configService.get<EmailConfig>('email')!;
    this.templatesPath = path.join(
      process.cwd(),
      'src',
      'infrastructure',
      'email',
      'templates',
    );

    this.transporter = nodemailer.createTransport({
      host: this.emailConfig.host,
      port: this.emailConfig.port,
      secure: this.emailConfig.secure,
      auth: this.emailConfig.auth.user
        ? {
            user: this.emailConfig.auth.user,
            pass: this.emailConfig.auth.pass,
          }
        : undefined,
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const html = await this.renderTemplate(options.template, options.context);

      await this.transporter.sendMail({
        from: `"${this.emailConfig.from.name}" <${this.emailConfig.from.address}>`,
        to: options.to,
        subject: options.subject,
        html,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  private async renderTemplate(
    templateName: string,
    context: Record<string, unknown>,
  ): Promise<string> {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const template = handlebars.compile(templateContent);
      return template(context);
    } catch (error) {
      console.error(`Error rendering template ${templateName}:`, error);
      throw new Error(`Failed to render email template: ${templateName}`);
    }
  }

  async sendEmailConfirmation(
    email: string,
    confirmationToken: string,
  ): Promise<void> {
    const confirmationUrl = `${this.emailConfig.baseUrl}/api/v1/auth/confirm-email?token=${confirmationToken}`;

    await this.sendEmail({
      to: email,
      subject: 'Confirm Your Email Address',
      template: 'email-confirmation',
      context: {
        confirmationUrl,
        email,
        currentYear: new Date().getFullYear(),
      },
    });
  }
}
