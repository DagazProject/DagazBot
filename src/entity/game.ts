import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity()
export class game {
    @PrimaryColumn()
    id: number;

    @Index()
    @Column({ nullable: true })
    parent_id: number;
    @ManyToOne(type => game)
    @JoinColumn({ name: "parent_id" })
    parent: game;

    @Column({ nullable: false, type: "varchar", length: 100 })
    name: string;

    @Column({ nullable: true, type: "varchar", length: 1000 })
    description: string;
}