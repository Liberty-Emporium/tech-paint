// Role-based access control for TechPaint.
//
// Roles (most → least privilege):
//   owner     — Jesse/Troy/company owners. Full access to everything.
//   secretary — front-office / administrative support.
//   employee  — field staff (estimators/painters).
//   customer  — end customers (self-service estimate requests).
//
// The owner has all permissions; secretary and employee are scoped subsets;
// customers only interact with their own estimate requests.

export type Role = 'owner' | 'secretary' | 'employee' | 'customer';

export type Permission =
  | 'settings'    // AI API key, email, model, NextAuth config
  | 'users'       // create/delete user accounts + assign roles
  | 'customers'   // view / create / edit / delete customer records
  | 'documents'   // upload / view / manage documents & contracts
  | 'estimates';  // generate / view / manage estimates

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ['settings', 'users', 'customers', 'documents', 'estimates'],
  secretary: ['customers', 'documents', 'estimates'],
  employee: ['estimates', 'documents'],
  customer: ['estimates'],
};

export function hasPermission(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const allowed = ROLE_PERMISSIONS[role];
  return !!allowed && allowed.includes(permission);
}

export const ALL_ROLES: Role[] = ['owner', 'secretary', 'employee', 'customer'];
