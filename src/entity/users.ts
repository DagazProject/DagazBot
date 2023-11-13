import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class users {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false,  type: "varchar", length: 100 })
    username: string;

    @Column({ type: "varchar", length: 100 })
    firstname: string;

    @Column({ type: "varchar", length: 100 })
    lastname: string;

    @Column({default: () => "now()", nullable: false})
    created: Date;
}