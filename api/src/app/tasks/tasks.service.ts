import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { Organization } from '../organizations/organization.entity';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private repo: Repository<Task>,
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,
    ) { }

    async create(title: string, category: string, organizationId: number) {
        const org = await this.orgRepo.findOne({ where: { id: organizationId } });
        if (!org) throw new Error('Organization not found');

        const task = this.repo.create({
            title,
            category,
            organization: org, // <-- assign the entity, not the ID
        });

        return this.repo.save(task);
    }

    findOne(id: number) {
        return this.repo.findOneBy({ id });
    }

    update(id: number, updateTaskDto: Partial<Task>) {
        return this.repo.update(id, updateTaskDto);
    }


    findAll() {
        return this.repo.find();
    }

    delete(id: number) {
        return this.repo.delete(id);
    }
}
