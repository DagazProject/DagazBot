import {MigrationInterface, QueryRunner} from "typeorm";

export class tgq1702892899050 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`insert into info_type(id, name) values(1, 'Текст задания')`);
        await queryRunner.query(`insert into info_type(id, name) values(2, 'Текст поздравления')`);

        await queryRunner.query(`insert into node_type(id, name) values(1, 'Стартовая локация')`);
        await queryRunner.query(`insert into node_type(id, name) values(2, 'Финальная локация')`);
        await queryRunner.query(`insert into node_type(id, name) values(3, 'Провальная локация')`);
        await queryRunner.query(`insert into node_type(id, name) values(4, 'Пустая локация')`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`delete from node_type`);
        await queryRunner.query(`delete from info_type`);
    }
}
