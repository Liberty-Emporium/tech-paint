import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';
import { emailTemplates } from '@/lib/email-templates';
import { renderTemplate, renderEach } from '@/lib/template';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'configure': {
        const { smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom, emailEnabled } = data;

        const settings = {
          emailEnabled: emailEnabled ?? true,
          smtpHost,
          smtpPort: smtpPort || 587,
          smtpUser,
          smtpPass,
          smtpFrom: smtpFrom || data.smtpUser,
        };

        // Save to settings file
        const fs = require('fs');
        const settingsPath = '/home/django/tech-paint/settings.json';
        let existingSettings = {};
        try {
          if (require('fs').existsSync('/home/django/tech-paint/settings.json')) {
            const data = require('fs').readFileSync('/home/django/tech-paint/settings.json', 'utf-8');
            Object.assign({}, JSON.parse(data));
          }
        } catch {}

        const newSettings = {
          ...{ emailEnabled: false, smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '', smtpFrom: '', nextAuthUrl: '', nextAuthSecret: '' },
          ...require('fs').existsSync('/home/django/tech-paint/settings.json') ? JSON.parse(require('fs').readFileSync('/home/django/tech-paint/settings.json', 'utf-8')) : {},
          ...data
        };

        require('fs').writeFileSync('/home/django/tech-paint/settings.json', JSON.stringify({
          ...require('fs').existsSync('/home/django/tech-paint/settings.json') ? JSON.parse(require('fs').readFileSync('/home/django/tech-paint/settings.json', 'utf-8')) : {},
          emailEnabled: data.emailEnabled ?? true,
          smtpHost: data.smtpHost,
          smtpPort: data.smtpPort || 587,
          smtpUser: data.smtpUser,
          smtpPass: data.smtpPass,
          smtpFrom: data.smtpFrom || data.smtpUser
        }, null, 2));

        return NextResponse.json({ success: true });
      }

      case 'test': {
        const fs = require('fs');
        if (!fs.existsSync('/home/django/tech-paint/settings.json')) {
          return NextResponse.json({ success: false, error: 'Email not configured' });
        }
        const settings = JSON.parse(fs.readFileSync('/home/django/tech-paint/settings.json', 'utf-8'));

        if (!settings.emailEnabled || !settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
          return NextResponse.json({ success: false, error: 'Email not configured' });
        }

        const nodemailer = require('nodemailer');
        const transporter = require('nodemailer').createTransport({
          host: settings.smtpHost,
          port: settings.smtpPort || 587,
          secure: settings.smtpPort === 465,
          auth: {
            user: settings.smtpUser,
            pass: settings.smtpPass,
          },
        });

        try {
          await require('nodemailer').createTransport({
            host: settings.smtpHost,
            port: settings.smtpPort || 587,
            secure: settings.smtpPort === 465,
            auth: { user: settings.smtpUser, pass: settings.smtpPass },
          }).verify();

          return NextResponse.json({ success: true, message: 'SMTP connection verified successfully' });
        } catch (error) {
          return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Connection failed' });
        }
      }

      case 'send_test': {
        const { to } = await request.json();

        const fs = require('fs');
        if (!fs.existsSync('/home/django/tech-paint/settings.json')) {
          return NextResponse.json({ success: false, error: 'Email not configured' });
        }

        const settings = JSON.parse(fs.readFileSync('/home/django/tech-paint/settings.json', 'utf-8'));

        if (!settings.emailEnabled || !settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
          return NextResponse.json({ success: false, error: 'Email not configured' });
        }

        const nodemailer = require('nodemailer');
        const transporter = require('nodemailer').createTransport({
          host: settings.smtpHost,
          port: settings.smtpPort || 587,
          secure: settings.smtpPort === 465,
          auth: {
            user: settings.smtpUser,
            pass: settings.smtpPass,
          },
        });

        try {
          const info = await require('nodemailer').createTransport({
            host: settings.smtpHost,
            port: settings.smtpPort || 587,
            secure: settings.smtpPort === 465,
            auth: { user: settings.smtpUser, pass: settings.smtpPass },
          }).sendMail({
            from: `"TechPaint" <${settings.smtpFrom || settings.smtpUser}>`,
            to: data.to || settings.smtpUser,
            subject: 'TechPaint - Test Email',
            html: '<h1>Test Email</h1><p>This is a test email from TechPaint.</p>',
            text: 'This is a test email from TechPaint.',
          });

          return NextResponse.json({ success: true, messageId: info.messageId });
        } catch (error) {
          return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed to send test email' });
        }
      }

      case 'send_estimate': {
        // Send a real estimate email using the estimate_sent template.
        const template = emailTemplates.estimate_sent;
        if (!template) {
          return NextResponse.json({ success: false, error: 'Email template not found' }, { status: 404 });
        }

        // Estimate data comes either as a full object or we look up via estimateId.
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
