import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from './task.entity';
import { Organization } from '../organizations/organization.entity';
import { JwtUser } from '../auth/jwt-user.interface';
import { OrganizationService } from '../organizations/organization.service';
import { LogService } from '../logs/log.service';



@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private repo: Repository<Task>,
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,
        private organizationsService: OrganizationService,

        private readonly logService: LogService,
    ) { }

    async create(title: string, category: string, organizationId: number, user: JwtUser) {
        const org = await this.orgRepo.findOne({ where: { id: organizationId } });
        if (!org) throw new Error('Organization not found');

        // Build a set of org IDs the user can access
        const accessibleOrgIds = new Set<number>();
        for (const membership of user.memberships) {
            const orgAndDescendants = await this.organizationsService.getOrgAndDescendants(membership.organizationId);
            orgAndDescendants.forEach((id) => accessibleOrgIds.add(id));
        }

        // Check if user is allowed to create in this org
        if (!accessibleOrgIds.has(organizationId)) {
            throw new ForbiddenException('You do not have permission to create a task in this organization');
        }

        // Create the task
        const task = this.repo.create({
            title,
            category,
            organization: org, // <-- assign the entity, not the ID
        });

        const savedTask = await this.repo.save(task);
        // Logging
        await this.logService.create(
            `Task "${savedTask.title}" created by user ${user.id} in organization ${savedTask.organization.id}`,
        );
        return savedTask;
    }

    async update(id: number, updateTaskDto: Partial<Task>, user: JwtUser) {
        // Build a set of org IDs the user can access for editing
        const accessibleOrgIds = new Set<number>();
        for (const membership of user.memberships) {
            const orgAndDescendants = await this.organizationsService.getOrgAndDescendants(membership.organizationId);
            orgAndDescendants.forEach((id) => accessibleOrgIds.add(id));
        }

        // Check if user is allowed to create in this org
        if (!accessibleOrgIds.has(id)) {
            throw new ForbiddenException('You do not have permission to edit a task in this organization');
        }

        // Update the task
        const updatedTask = await this.repo.update(id, updateTaskDto)
        // Logging
        await this.logService.create(
            `Task "${id}" updated by user ${user.id}`,
        );

        return updatedTask;
    }


    async findAll(user: JwtUser) {
        const orgIds = new Set<number>();

        for (const membership of user.memberships) {
            const orgAndDescendants = await this.organizationsService.getOrgAndDescendants(membership.organizationId);
            orgAndDescendants.forEach((id) => orgIds.add(id));
        }

        return this.repo.find({ where: { organization: In([...orgIds]) } });
    }

    async delete(id: number, user: JwtUser) {
        const deletedTask = await this.repo.delete(id);
        // Logging
        await this.logService.create(
            `Task "${id}" deleted by user ${user.id}`,
        );
        return deletedTask;
    }
}
