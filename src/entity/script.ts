import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class script {
    @PrimaryColumn()
    id: number;

    @Column({ nullable: false, type: "varchar", length: 100 })
    name: string;
}