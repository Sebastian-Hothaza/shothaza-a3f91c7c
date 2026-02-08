import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Organization } from '../organizations/organization.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  category!: string;

  @Column({ default: false })
  completed!: boolean;

  @ManyToOne(()=> Organization, (org) => org.tasks)
  organization!: Organization
}
