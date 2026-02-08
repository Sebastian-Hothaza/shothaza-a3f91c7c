import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../organizations/organization.entity';

@Injectable()
export class OrganizationService {
    constructor(
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,
    ) { }

    // Returns the id of the provided org as well as the id's of parent orgs
    async getOrgAndAncestors(orgId: number): Promise<number[]> {
        const ids: number[] = [];
        let current = await this.orgRepo.findOne({ where: { id: orgId }, relations: ['parent'], }); // We have the relations 'parent' to prevent lazy loading

        while (current) {
            ids.push(current.id);
            if (!current.parent) break;
            current = await this.orgRepo.findOne({ where: { id: current.parent.id } });
        }
        return ids;
    }

    // Returns the id of the provided org as well as the id's of parent orgs
    async getOrgAndDescendants(orgId: number): Promise<number[]> {
        const ids: number[] = [orgId];

        const children = await this.orgRepo.find({
            where: { parent: { id: orgId } },
        });

        for (const child of children) {
            ids.push(child.id);
        }

        return ids;
    }

}