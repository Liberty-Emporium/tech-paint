import { NextRequest, NextResponse } from 'next/server';

const SETTINGS_FILE = '/home/django/tech-paint/settings.json';

interface Settings {
  emailEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  nextAuthUrl: string;
  nextAuthSecret: string;
}

const defaultSettings = {
  emailEnabled: false,
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpFrom: '',
  nextAuthUrl: '',
  nextAuthSecret: '',
};

async function readSettings(): Promise<typeof defaultSettings> {
  try {
    const fs = require('fs');
    if (require('fs').existsSync(SETTINGS_FILE)) {
      const data = require('fs').readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch {
    // Ignore errors, return defaults
  }
  return defaultSettings;
}

async function writeSettings(settings: typeof defaultSettings): Promise<void> {
  const fs = require('fs');
  const dir = require('path').dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export async function GET() {
  const settings = await readSettings();
  // Don't expose password in GET
  const { smtpPass, nextAuthSecret, ...safeSettings } = await readSettings();
  return Response.json(safeSettings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await writeSettings(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}