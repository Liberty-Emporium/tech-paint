// Central on-disk path config for TechPaint.
// Portable: resolves relative to the running app directory (process.cwd()),
// overridable via env vars. Removes the old hardcoded /home/django/... paths.
import { join } from 'path';

export const APP_DIR = process.cwd();
export const DATA_DIR = process.env.DATA_DIR || join(APP_DIR, 'data');
export const UPLOADS_DIR = process.env.UPLOADS_DIR || join(APP_DIR, 'uploads');

// settings.json lives at the app root (same location as before, but computed, not hardcoded).
export const SETTINGS_FILE = process.env.SETTINGS_FILE || join(APP_DIR, 'settings.json');
export const USERS_FILE = process.env.USERS_FILE || join(DATA_DIR, 'users.json');
