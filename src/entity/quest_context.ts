import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { node_image } from "./node_image";
import { action } from "./action";
import { node } from "./node";

@Entity()
export class quest_context {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    action_id: number;
    @ManyToOne(type => action)
    @JoinColumn({ name: "action_id" })
    action: action;

    @Index()
    @Column({ nullable: true })
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
}