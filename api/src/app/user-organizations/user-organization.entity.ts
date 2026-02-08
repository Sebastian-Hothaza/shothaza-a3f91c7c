import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, } from 'typeorm';
import { User } from '../users/user.entity';
import { Organization } from '../organizations/organization.entity';
import { Role } from './role.enum';

@Entity()
export class UserOrganization {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.memberships)
  user!: User;

  @ManyToOne(() => Organization)
  organization!: Organization;

  @Column({ type: 'enum', enum: Role })
  role!: Role;
}
