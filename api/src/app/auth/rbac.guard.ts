import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role, RoleRank } from './role.enum';
import { Request } from 'express';
import { OrganizationService } from '../organizations/organization.service';
import { JwtUser } from './jwt-user.interface';

@Injectable()
export class RbacGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private organizationsService: OrganizationService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        // If no roles required, shortcut to allow
        if (!requiredRoles || requiredRoles.length === 0) return true;


        // Check for valid user
        const request = context.switchToHttp().getRequest<Request>();


        const user = request.user as JwtUser;
        if (!user || !user.memberships) throw new ForbiddenException('No user or memberships found');

        // Determine target organization
        const organizationId = request.body?.organizationId || request.params?.organizationId;
        
        // If no org context, this is a non-org-scoped route (e.g. GET /tasks)
        // Let the request through — data scoping happens in the service
        if (!organizationId) {
            return true;
        }


        // Get all ancestor org IDs (including self)
        const allowedOrgIds = await this.organizationsService.getOrgAndAncestors(organizationId);

        // Find highest role user has across allowed orgs
        let highestRole: Role | null = null;
        for (const membership of user.memberships) {
            if (allowedOrgIds.includes(membership.organizationId)) {
                if (!highestRole || RoleRank[membership.role] > RoleRank[highestRole]) {
                    highestRole = membership.role;
                }
            }
        }

        if (!highestRole) throw new ForbiddenException('No access to this organization');

        // Check if role satisfies any required role
        const allowed = requiredRoles.some(
            (requiredRole) =>
                RoleRank[highestRole!] >= RoleRank[requiredRole],
        );

        if (!allowed) throw new ForbiddenException('Insufficient role');

        return true;
    }
}
