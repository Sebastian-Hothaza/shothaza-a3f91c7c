import { Entity, PrimaryGeneratedColumn, Column, OneToMany, } from 'typeorm';
import { UserOrganization } from '../user-organizations/user-organization.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  passwordHash!: string;

  // One user can have multiple memberships in different organizations
  @OneToMany(() => UserOrganization, (uo) => uo.user)
  memberships!: UserOrganization[];
}
