import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrganization } from '../user-organizations/user-organization.entity';
import { Role, RoleRank } from '../user-organizations/role.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @InjectRepository(UserOrganization)
        private userOrgRepo: Repository<UserOrganization>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles) {
            return true; // no RBAC required
        }

        const request = context.switchToHttp().getRequest();
        const userId = request.user.userId;

        const orgId =
            Number(request.params.orgId) ??
            Number(request.body.orgId);

        if (!orgId) {
            throw new ForbiddenException('Organization not specified');
        }

        // Load memberships
        const memberships = await this.userOrgRepo.find({
            where: { user: { id: userId } },
            relations: ['organization', 'organization.parent'],
        });

        // Resolve effective role
        let effectiveRole: Role | null = null;

        for (const m of memberships) {
            if (
                m.organization.id === orgId ||
                m.organization.parent?.id === orgId
            ) {
                if (
                    !effectiveRole ||
                    RoleRank[m.role] > RoleRank[effectiveRole]
                ) {
                    effectiveRole = m.role;
                }
            }
        }

        if (!effectiveRole) {
            throw new ForbiddenException('No access to organization');
        }

        const allowed = requiredRoles.some(
            (r) => RoleRank[effectiveRole!] >= RoleRank[r],
        );

        if (!allowed) {
            throw new ForbiddenException('Insufficient role');
        }

        return true;
    }
}
