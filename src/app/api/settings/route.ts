import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/require-auth';
import { SETTINGS_FILE } from '@/lib/config';

const fs = require('fs');
const path = require('path');

interface Settings {
  emailEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  nextAuthUrl: string;
  nextAuthSecret: string;
  llmProvider: string;
  llmModel: string;
  llmApiKey: string;
  llmTemperature: number;
  llmMaxTokens: number;
}

const defaultSettings: Settings = {
  emailEnabled: false,
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpFrom: '',
  nextAuthUrl: '',
  nextAuthSecret: '',
  llmProvider: 'openrouter',
  llmModel: 'google/gemma-4-31b-it:free',
  llmApiKey: '',
  llmTemperature: 0.7,
  llmMaxTokens: 4000,
};

function readSettings(): Settings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch {
    // Ignore errors, return defaults
  }
  return defaultSettings;
}

function writeSettings(settings: Settings): void {
  path.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

// GET /api/settings — owner only; never exposes the secret/API key.
export async function GET() {
  const { user, error } = await requirePermission('settings');
  if (error) return error;
  const settings = readSettings();
  const { smtpPass, nextAuthSecret, llmApiKey, ...safeSettings } = settings;
  return NextResponse.json(safeSettings);
}

// POST /api/settings — owner only.
export async function POST(request: NextRequest) {
  const { error } = await requirePermission('settings');
  if (error) return error;
  try {
    const body = await request.json() as Partial<Settings>;
    const current = readSettings();
    writeSettings({ ...current, ...body });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to save settings:', err);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
