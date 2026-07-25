import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';

export async function POST(request: Request) {
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
        
        const newSettings = { ...{ emailEnabled: false, smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '', smtpFrom: '', nextAuthUrl: '', nextAuthSecret: '' }, ...require('fs').existsSync('/home/django/tech-paint/settings.json') ? JSON.parse(require('fs').readFileSync('/home/django/tech-paint/settings.json', 'utf-8')) : {}, ...data };
        
        require('fs').writeFileSync('/home/django/tech-paint/settings.json', JSON.stringify({ ...require('fs').existsSync('/home/django/tech-paint/settings.json') ? JSON.parse(require('fs').readFileSync('/home/django/tech-paint/settings.json', 'utf-8')) : {}, emailEnabled: data.emailEnabled ?? true, smtpHost: data.smtpHost, smtpPort: data.smtpPort || 587, smtpUser: data.smtpUser, smtpPass: data.smtpPass, smtpFrom: data.smtpFrom || data.smtpUser }, null, 2));

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

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}