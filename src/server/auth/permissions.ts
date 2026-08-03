/**
 * Roles & Permissions Definition Module
 *
 * Roles:
 * - Super Admin: Full system control over all modules & settings
 * - Admin: Full access except system-level administrative overrides
 * - Manager: Operational management (Products, Orders, Customers, Inventory, Expenses, Reports, AI Assistant)
 * - Staff: Basic operational access (Orders, Products read, Customers read, AI Assistant read)
 *
 * Modules:
 * - Products, Orders, Customers, Inventory, Expenses, Reports, Settings, AI Assistant
 */

export type RoleName = 'Super Admin' | 'Admin' | 'Manager' | 'Staff';

export type SystemModule =
  | 'Products'
  | 'Orders'
  | 'Customers'
  | 'Inventory'
  | 'Expenses'
  | 'Reports'
  | 'Settings'
  | 'AIAssistant';

export type PermissionAction = 'read' | 'create' | 'update' | 'delete' | 'manage' | 'export';

export interface Permission {
  module: SystemModule;
  actions: PermissionAction[];
}

export const ROLE_PERMISSIONS: Record<RoleName, Record<SystemModule, PermissionAction[]>> = {
  'Super Admin': {
    Products: ['read', 'create', 'update', 'delete', 'manage', 'export'],
    Orders: ['read', 'create', 'update', 'delete', 'manage', 'export'],
    Customers: ['read', 'create', 'update', 'delete', 'manage', 'export'],
    Inventory: ['read', 'create', 'update', 'delete', 'manage', 'export'],
    Expenses: ['read', 'create', 'update', 'delete', 'manage', 'export'],
    Reports: ['read', 'create', 'update', 'delete', 'manage', 'export'],
    Settings: ['read', 'create', 'update', 'delete', 'manage', 'export'],
    AIAssistant: ['read', 'create', 'update', 'delete', 'manage', 'export'],
  },
  Admin: {
    Products: ['read', 'create', 'update', 'delete', 'export'],
    Orders: ['read', 'create', 'update', 'delete', 'export'],
    Customers: ['read', 'create', 'update', 'delete', 'export'],
    Inventory: ['read', 'create', 'update', 'delete', 'export'],
    Expenses: ['read', 'create', 'update', 'delete', 'export'],
    Reports: ['read', 'export'],
    Settings: ['read', 'update'],
    AIAssistant: ['read', 'create'],
  },
  Manager: {
    Products: ['read', 'create', 'update'],
    Orders: ['read', 'create', 'update'],
    Customers: ['read', 'create', 'update'],
    Inventory: ['read', 'create', 'update'],
    Expenses: ['read', 'create', 'update'],
    Reports: ['read'],
    Settings: [], // Manager cannot access Settings
    AIAssistant: ['read', 'create'],
  },
  Staff: {
    Products: ['read'],
    Orders: ['read', 'create'],
    Customers: ['read', 'create'],
    Inventory: ['read'],
    Expenses: [], // Staff cannot access Expenses
    Reports: [], // Staff cannot access Reports
    Settings: [], // Staff cannot access Settings
    AIAssistant: ['read'],
  },
};

/**
 * Checks if a given role possesses permission for a module action
 */
export function hasPermission(
  role: RoleName | string,
  module: SystemModule,
  action: PermissionAction
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role as RoleName];
  if (!rolePermissions) return false;

  const allowedActions = rolePermissions[module] || [];
  return allowedActions.includes(action) || allowedActions.includes('manage');
}

/**
 * Returns complete list of permissions granted to a role
 */
export function getRolePermissions(role: RoleName | string): Record<SystemModule, PermissionAction[]> {
  return ROLE_PERMISSIONS[role as RoleName] || {
    Products: [],
    Orders: [],
    Customers: [],
    Inventory: [],
    Expenses: [],
    Reports: [],
    Settings: [],
    AIAssistant: [],
  };
}
