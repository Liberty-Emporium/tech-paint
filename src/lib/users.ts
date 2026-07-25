// In-memory user store for Coltrane Tech Paint.
// Users persist across hot-reloads via global.
import { readFileSync, existsSync } from 'fs';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'customer';
  company?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __users: User[] | undefined;
}

const SETTINGS_PATH = '/home/django/tech-paint/settings.json';

function loadUsersFromDisk(): User[] | null {
  try {
    const path = '/home/django/tech-paint/data/users.json';
    if (existsSync(path)) {
      return JSON.parse(readFileSync(path, 'utf-8'));
    }
  } catch {}
  return null;
}

function getDefaultUsers(): User[] {
  // Try to read admin credentials from settings.json (what the user configured)
  let adminEmail = 'admin@coltranetechpaint.com';
  let adminPassword = 'admin123';
  try {
    if (existsSync(SETTINGS_PATH)) {
      const s = JSON.parse(readFileSync(SETTINGS_PATH, 'utf-8'));
      if (s.adminEmail) adminEmail = s.adminEmail;
      if (s.adminPassword) adminPassword = s.adminPassword;
    }
  } catch {}

  return [
    {
      id: '1',
      email: adminEmail,
      password: adminPassword,
      name: 'Admin',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      email: 'jesse@coltranetechpaint.com',
      password: '1234',
      name: 'Jesse Coltrane',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      email: 'troy@coltranetechpaint.com',
      password: '4321',
      name: 'Troy Coltrane',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  ];
}

// Initialize from disk or defaults
function initUsers(): User[] {
  if (global.__users) return global.__users;
  const disk = loadUsersFromDisk();
  global.__users = disk || getDefaultUsers();
  return global.__users;
}

export function getUsers(): User[] {
  return initUsers();
}

export function getUserByEmail(email: string): User | undefined {
  return initUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): User | undefined {
  return initUsers().find(u => u.id === id);
}

export function addUser(user: Omit<User, 'id' | 'createdAt'>): User {
  const users = initUsers();
  const newUser: User = {
    ...user,
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  global.__users = users;
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = initUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  global.__users = users;
  return users[idx];
}

export function deleteUser(id: string): boolean {
  const users = initUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  global.__users = users;
  return true;
}

// Persist to disk so users survive restarts
export async function saveUsersToDisk(): Promise<void> {
  const { writeFile, mkdir } = await import('fs/promises');
  const { join } = await import('path');
  const dir = join(process.cwd(), 'data');
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'users.json'), JSON.stringify(initUsers(), null, 2));
}
