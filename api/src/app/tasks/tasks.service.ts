import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from './task.entity';
import { Organization } from '../organizations/organization.entity';
import { JwtUser } from '../auth/jwt-user.interface';
import { OrganizationService } from '../organizations/organization.service';


@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private repo: Repository<Task>,
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,
        private organizationsService: OrganizationService,
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

        return this.repo.save(task);
    }

    update(id: number, updateTaskDto: Partial<Task>) {
        return this.repo.update(id, updateTaskDto);
    }


    async findAll(user: JwtUser) {
        const orgIds = new Set<number>();

        for (const membership of user.memberships) {
            const accessibleOrgIds = await this.organizationsService.getOrgAndDescendants(membership.organizationId);
            accessibleOrgIds.forEach((id) => orgIds.add(id));
        }

        return this.repo.find({ where: { organization: In([...orgIds]) } });
    }

    delete(id: number) {
        return this.repo.delete(id);
    }
}
