import { createContext, useContext } from 'react';

export type OrgRole = 'full_admin' | 'treasurer' | 'expense_admin';

export interface Organisation {
  id: string;
  name: string;
  short_code: 'southdale' | 'bambanani';
}

export interface OrgContextValue {
  organisation: Organisation | null;
  role: OrgRole | null;
  setOrganisation: (org: Organisation | null) => void;
  canAccessPayroll: boolean;
  canAccessFinance: boolean;
  canCreateExpenses: boolean;
}

export const OrgContext = createContext<OrgContextValue>({
  organisation: null,
  role: null,
  setOrganisation: () => {},
  canAccessPayroll: false,
  canAccessFinance: false,
  canCreateExpenses: false,
});

export function useOrg() {
  return useContext(OrgContext);
}

export function derivePermissions(role: OrgRole | null) {
  return {
    canAccessPayroll: role === 'full_admin' || role === 'treasurer',
    canAccessFinance: role === 'full_admin' || role === 'treasurer',
    canCreateExpenses: role === 'full_admin' || role === 'treasurer' || role === 'expense_admin',
  };
}
