import {MigrationInterface, QueryRunner} from "typeorm";

export class dbproc1701330484301 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`create or replace function createAccount(
            in pUser integer,
            in pServer integer
          ) returns integer
          as $$
          declare
            pLogin text;
            pAccount integer default null;
          begin
            select value into strict pLogin
            from   user_param
            where  user_id = pUser and type_id = 2;
            select a.id into pAccount
            from   account a
            inner  join user_param b on (b.action_id = a.id and type_id = 2)
            where  a.server_id = pServer and a.deleted is null
            and    b.value = pLogin
            limit  1;
            if pAccount is null then
               insert into account(user_id, server_id)
               values (pUser, pServer)
               returning id into pAccount;  
            else
               update account set user_id = pUser, created = now() where id = pAccount;
               delete from user_param where account_id = pAccount;
            end if;
            update user_param set account_id = pAccount, user_id = null
            where user_id = pUser and type_id in (2, 3, 4);
          end;
          $$ language plpgsql VOLATILE`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`drop function createAccount(integer, integer)`);
    }
}
