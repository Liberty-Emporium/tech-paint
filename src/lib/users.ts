// Persistent user store for TechPaint.
// Users are backed by a JSON file on disk so they survive restarts.
import { readFileSync, existsSync } from 'fs';
import { Role } from './permissions';
import { USERS_FILE, SETTINGS_FILE } from './config';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  company?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __users: User[] | undefined;
}

function loadUsersFromDisk(): User[] | null {
  try {
    if (existsSync(USERS_FILE)) {
      return JSON.parse(readFileSync(USERS_FILE, 'utf-8'));
    }
  } catch {}
  return null;
}

function getDefaultUsers(): User[] {
  // Owner (Jesse) is the full-permission account; admin/Troy are owners too.
  let adminEmail = 'admin@coltranetechpaint.com';
  let adminPassword = 'admin123';
  try {
    if (existsSync(SETTINGS_FILE)) {
      const s = JSON.parse(readFileSync(SETTINGS_FILE, 'utf-8'));
      if (s.adminEmail) adminEmail = s.adminEmail;
      if (s.adminPassword) adminPassword = s.adminPassword;
    }
  } catch {}

  return [
    {
      id: '1',
      email: adminEmail,
      password: adminPassword,
      name: 'Owner',
      role: 'owner',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      email: 'jesse@coltranetechpaint.com',
      password: '1234',
      name: 'Jesse Coltrane',
      role: 'owner',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      email: 'troy@coltranetechpaint.com',
      password: '4321',
      name: 'Troy Coltrane',
      role: 'owner',
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
  saveUsersToDisk();
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = initUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  global.__users = users;
  saveUsersToDisk();
  return users[idx];
}

export function deleteUser(id: string): boolean {
  const users = initUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  global.__users = users;
  saveUsersToDisk();
  return true;
}

// Persist to disk so users survive restarts.
export function saveUsersToDisk(): void {
  try {
    const { writeFileSync, mkdirSync } = require('fs');
    const { dirname } = require('path');
    mkdirSync(dirname(USERS_FILE), { recursive: true });
    writeFileSync(USERS_FILE, JSON.stringify(initUsers(), null, 2));
  } catch (e) {
    console.error('Failed to save users to disk:', e);
  }
}
