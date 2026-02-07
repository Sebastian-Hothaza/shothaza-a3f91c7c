import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { UserOrganization } from '../user-organizations/user-organization.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  passwordHash!: string;

  @OneToMany(
    () => UserOrganization,
    (uo) => uo.user
  )
  memberships!: UserOrganization[];
}
