export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER',
}

export const RoleRank: Record<Role, number> = {
  [Role.VIEWER]: 1,
  [Role.ADMIN]: 2,
  [Role.OWNER]: 3,
};
