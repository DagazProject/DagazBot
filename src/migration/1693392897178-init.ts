import {MigrationInterface, QueryRunner} from "typeorm";

export class init1693392897178 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`insert into option_type(id, name) values(1, 'TOKEN')`);

        await queryRunner.query(`insert into server_type(id, name) values(1, 'Telegram')`);
        await queryRunner.query(`insert into server_type(id, name) values(2, 'Dagaz Server')`);

        await queryRunner.query(`insert into server(id, type_id) values(1, 1)`);
        await queryRunner.query(`insert into server(id, type_id, url, api) values(2, 2, 'https://games.dtco.ru', 'https://games.dtco.ru/api')`);

        await queryRunner.query(`insert into server_option(id, type_id, server_id, value) values(1, 1, 1, 'XXXXXXXXXX:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`delete from server_option`);
        await queryRunner.query(`delete from server`);
        await queryRunner.query(`delete from server_type`);
        await queryRunner.query(`delete from option_type`);
    }
}
