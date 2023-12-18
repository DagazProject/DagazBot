import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { quest } from "./quest";
import { node_type } from "./node_type";
import { node_image } from "./node_image";

@Entity()
export class node {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    quest_id: number;
    @ManyToOne(type => quest)
    @JoinColumn({ name: "quest_id" })
    quest: quest;

    @Index()
    @Column({ nullable: true })
    type_id: number;
    @ManyToOne(type => node_type)
    @JoinColumn({ name: "type_id" })
    types: node_type;

    @Index()
    @Column({ nullable: true })
    image_id: number;
    @ManyToOne(type => node_image)
    @JoinColumn({ name: "image_id" })
    image: node_image;
}