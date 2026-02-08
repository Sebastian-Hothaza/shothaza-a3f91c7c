import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, } from 'typeorm';
import { Task } from '../tasks/task.entity';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  // Many children will just have one parent
  @ManyToOne(() => Organization, (org) => org.children, { nullable: true })
  parent?: Organization;

  // One org can have many children
  @OneToMany(() => Organization, (org) => org.parent)
  children!: Organization[];

  @OneToMany(() => Task, (task) => task.organization)
  tasks!: Task[];
}
