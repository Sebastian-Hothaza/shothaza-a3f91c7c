import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToOne(
    () => Organization,
    (org) => org.children,
    { nullable: true }
  )
  parent?: Organization;

  @OneToMany(
    () => Organization,
    (org) => org.parent
  )
  children!: Organization[];
}
