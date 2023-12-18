import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { node } from "./node";
import { node_image } from "./node_image";

@Entity()
export class node_info {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    node_id: number;
    @ManyToOne(type => node)
    @JoinColumn({ name: "node_id" })
    node: node;

    @Index()
    @Column({ nullable: true })
    image_id: number;
    @ManyToOne(type => node_image)
    @JoinColumn({ name: "image_id" })
    image: node_image;

    @Column({ nullable: true,  type: "text" })
    en: string;

    @Column({ nullable: true,  type: "text" })
    ru: string;

    @Column({ nullable: true,  type: "varchar", length: 100 })
    rule: string;

    @Column({ nullable: false, type: "integer" })
    order_num: number;
}