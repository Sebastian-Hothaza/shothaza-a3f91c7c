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
  email!: string;

  @Column()
  passwordHash!: string;

  // One user can have multiple memberships in different organizations
  @OneToMany(
    () => UserOrganization, // Tells ORM what entity is on the many side
    (uo) => uo.user // Tells ORM which property on the other entity is the reference back to this entity
  )
  memberships!: UserOrganization[];
}
