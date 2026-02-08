import { Role } from '../auth/role.enum';

export interface JwtMembership {
  organizationId: number;
  role: Role;
}

export interface JwtUser {
  id: number;
  memberships: JwtMembership[];
}
