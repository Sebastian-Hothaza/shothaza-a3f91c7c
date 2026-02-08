import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role, RoleRank } from './role.enum';
import { Request } from 'express';
import { OrganizationService } from '../organizations/organization.service';
import { JwtUser } from './jwt-user.interface';
import { Repository } from 'typeorm';
import { Task } from '../tasks/task.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RbacGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private organizationsService: OrganizationService,
        @InjectRepository(Task)
        private readonly taskRepo: Repository<Task>
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );


        // If no roles required, shortcut to allow
        if (!requiredRoles || requiredRoles.length === 0) return true;


        // Check for valid user and task(if provided)
        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user as JwtUser;
        const taskId = request.params?.id;

        if (!user || !user.memberships) throw new ForbiddenException('No user or memberships found');

        // Determine taskID

        let organizationId = request.body?.organizationId || request.params?.organizationId;

        if (!organizationId && taskId) {
            const task = await this.taskRepo.findOne({
                where: { id: Number(taskId) },
                relations: ['organization'], // <-- load the organization entity
            });
            if (!task) throw new ForbiddenException('Task not found');
            organizationId = task.organization.id;
        } else {
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
