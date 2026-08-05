import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';
import { emailTemplates } from '@/lib/email-templates';
import { renderTemplate, renderEach } from '@/lib/template';
import { requireAuth, requirePermission } from '@/lib/require-auth';
import { SETTINGS_FILE } from '@/lib/config';

const fs = require('fs');

function readSettings(): any {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
  } catch {}
  return {};
}

function writeSettings(settings: any): void {
  const path = require('path');
  path.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export async function POST(request: NextRequest) {
  // Any authenticated user may send templates, but configuring SMTP / testing
  // touches the settings file, so that's owner-only.
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'configure': {
        const cfg = await requirePermission('settings');
        if (cfg.error) return cfg.error;

        const existing = readSettings();
        writeSettings({
          ...existing,
          emailEnabled: data.emailEnabled ?? true,
          smtpHost: data.smtpHost,
          smtpPort: data.smtpPort || 587,
          smtpUser: data.smtpUser,
          smtpPass: data.smtpPass,
          smtpFrom: data.smtpFrom || data.smtpUser,
        });
        return NextResponse.json({ success: true });
      }

      case 'test': {
        const cfg = await requirePermission('settings');
        if (cfg.error) return cfg.error;

        const settings = readSettings();
        if (!settings.emailEnabled || !settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
          return NextResponse.json({ success: false, error: 'Email not configured' });
        }
        try {
          await emailService.verifyConnection();
          return NextResponse.json({ success: true, message: 'SMTP connection verified successfully' });
        } catch (error) {
          return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Connection failed' });
        }
      }

      case 'send_test': {
        const cfg = await requirePermission('settings');
        if (cfg.error) return cfg.error;

        const settings = readSettings();
        if (!settings.emailEnabled || !settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
          return NextResponse.json({ success: false, error: 'Email not configured' });
        }
        try {
          const result = await emailService.sendEmail({
            to: data.to || settings.smtpUser,
            subject: 'TechPaint - Test Email',
            html: '<h1>Test Email</h1><p>This is a test email from TechPaint.</p>',
            text: 'This is a test email from TechPaint.',
          });
          if (!result.success) return NextResponse.json({ success: false, error: result.error });
          return NextResponse.json({ success: true, messageId: result.messageId });
        } catch (error) {
          return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed to send test email' });
        }
      }

      case 'send_estimate': {
        const template = emailTemplates.estimate_sent;
        if (!template) {
          return NextResponse.json({ success: false, error: 'Email template not found' }, { status: 404 });
        }

        const estimate = data.estimate || data;
        const recipient = estimate.customerEmail || data.to;
        if (!recipient) {
          return NextResponse.json({ success: false, error: 'No recipient email provided' }, { status: 400 });
        }

        const signUrl = `${process.env.NEXTAUTH_URL || data.baseUrl || ''}/estimates/${estimate.id}`;
        const templateData = {
          ...estimate,
          signUrl,
          companyName: estimate.companyName || 'TechPaint',
          companyPhone: estimate.companyPhone || '',
          companyEmail: estimate.companyEmail || '',
          companyAddress: estimate.companyAddress || '',
        };

        const html = renderEach(renderTemplate(template.htmlContent(templateData), templateData), templateData);
        const text = renderEach(renderTemplate(template.textContent(templateData), templateData), templateData);

        const result = await emailService.sendEmail({
          to: recipient,
          subject: renderTemplate(template.subject, templateData),
          html,
          text,
        });

        if (!result.success) {
          return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }

        // Best-effort: mark estimate as sent so the UI reflects it.
        try {
          await fetch(`${process.env.NEXTAUTH_URL || ''}/api/estimates/${estimate.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'sent' }),
          }).catch(() => null);
        } catch { /* non-fatal */ }

        return NextResponse.json({ success: true, messageId: result.messageId });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
