import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

const SETTINGS_FILE = '/home/django/tech-paint/settings.json';

interface StoredSettings {
  emailEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  nextAuthUrl: string;
  nextAuthSecret: string;
}

function readSettings(): StoredSettings {
  try {
    if (fs.existsSync('/home/django/tech-paint/settings.json')) {
      const data = fs.readFileSync('/home/django/tech-paint/settings.json', 'utf-8');
      return { 
        emailEnabled: false, 
        smtpHost: '', 
        smtpPort: 587, 
        smtpUser: '', 
        smtpPass: '', 
        smtpFrom: '', 
        nextAuthUrl: '', 
        nextAuthSecret: '',
        ...JSON.parse(data) 
      };
    }
  } catch {
    // Ignore errors, return defaults
  }
  return { 
    emailEnabled: false, 
    smtpHost: '', 
    smtpPort: 587, 
    smtpUser: '', 
    smtpPass: '', 
    smtpFrom: '', 
    nextAuthUrl: '', 
    nextAuthSecret: '' 
  };
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: { host: string; port: number; secure: boolean; auth: { user: string; pass: string } } | null = null;

  private loadConfig(): { host: string; port: number; secure: boolean; auth: { user: string; pass: string } } | null {
    const settings = this.readSettings();
    if (!settings.emailEnabled || !settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
      return null;
    }
    return {
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    };
  }

  private readSettings() {
    try {
      if (fs.existsSync('/home/django/tech-paint/settings.json')) {
        const data = fs.readFileSync('/home/django/tech-paint/settings.json', 'utf-8');
        return { 
          emailEnabled: false, 
          smtpHost: '', 
          smtpPort: 587, 
          smtpUser: '', 
          smtpPass: '', 
          smtpFrom: '', 
          nextAuthUrl: '', 
          nextAuthSecret: '',
          ...JSON.parse(data) 
        };
      }
    } catch {
      // Ignore errors, return defaults
    }
    return { 
      emailEnabled: false, 
      smtpHost: '', 
      smtpPort: 587, 
      smtpUser: '', 
      smtpPass: '', 
      smtpFrom: '', 
      nextAuthUrl: '', 
      nextAuthSecret: '' 
    };
  }

  private getTransporter() {
    const config = this.loadConfig();
    if (!config) {
      return null;
    }
    if (!this.transporter || this.config !== config) {
      this.config = config;
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.auth,
      });
    }
    return this.transporter;
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const transporter = this.getTransporter();
    if (!transporter) {
      return { success: false, error: 'Email service not configured. Please configure SMTP settings in Settings.' };
    }

    const settings = this.readSettings();
    const fromEmail = settings.smtpFrom || this.config?.auth.user;

    try {
      const info = await this.getTransporter()!.sendMail({
        from: `"TechPaint" <${fromEmail}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
        attachments: options.attachments,
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email send failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async verifyConnection(): Promise<{ success: boolean; error?: string }> {
    const transporter = this.getTransporter();
    if (!transporter) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      await transporter.verify();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  isConfigured(): boolean {
    return this.getTransporter() !== null;
  }
}

export const emailService = new EmailService();