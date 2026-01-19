export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  SENIOR_DEV: 'senior_dev',
  JUNIOR_DEV: 'junior_dev',
  CONTRACTOR: 'contractor',
  CI: 'ci',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  owner: ['repo:admin', 'secrets:all', 'infra:all'],
  admin: ['repo:write', 'secrets:rotate', 'infra:read'],
  senior_dev: ['repo:write', 'merge:pr', 'infra:staging'],
  junior_dev: ['repo:read', 'pr:create'],
  contractor: ['repo:read', 'pr:create:fork'],
  ci: ['repo:read', 'secrets:access:scoped'],
};
