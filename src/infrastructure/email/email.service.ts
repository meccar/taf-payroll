import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import mjml2html from 'mjml';
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
      const mjmlPath = path.join(this.templatesPath, `${templateName}.mjml`);
      let templateContent: string;
      let isMjml = false;

      try {
        templateContent = await fs.readFile(mjmlPath, 'utf-8');
        isMjml = true;
      } catch {
        const hbsPath = path.join(this.templatesPath, `${templateName}.hbs`);
        templateContent = await fs.readFile(hbsPath, 'utf-8');
      }

      if (isMjml) {
        const { html, errors } = mjml2html(templateContent);
        if (errors && errors.length > 0) {
          console.warn('MJML compilation errors:', errors);
        }
        templateContent = html;
      }

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

  async sendEmailResetPassword(
    email: string,
    resetPasswordToken: string,
  ): Promise<void> {
    const resetPasswordUrl = `${this.emailConfig.baseUrl}/api/v1/auth/reset-password?token=${resetPasswordToken}`;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password',
      template: 'reset-password',
      context: {
        resetPasswordUrl,
        email,
        currentYear: new Date().getFullYear(),
      },
    });
  }
}
