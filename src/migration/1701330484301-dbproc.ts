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
            c integer;
          begin
            select value into strict pLogin
            from   user_param
            where  user_id = pUser and type_id = 2;
            select a.id into pAccount
            from   account a
            inner  join user_param b on (b.account_id = a.id and type_id = 2)
            where  a.server_id = pServer and a.deleted is null
            and    b.value = pLogin;
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
            return pAccount;
          end;
          $$ language plpgsql VOLATILE`);
          await queryRunner.query(`create or replace function chooseAccount(
            in pUser integer,
            in pAccount text,
            in pServer integer
          ) returns json
          as $$
          declare
            r json;
            x record;
            lAccount text default null;
          begin
            if pAccount is null then
               select string_agg(b.value, ',') as lAccount
               from   account a
               inner  join user_param b on (b.account_id = a.id and b.type_id = 2 and b.deleted is null)
               where  a.user_id = pUser and a.server_id = pServer and a.deleted is null;
               for x in
                   select case
                            when lAccount = '' then 0
                            else 2 
                          end as result, lAccount as login
               loop
                   r := row_to_json(x);  
               end loop;
            else
               select b.value into lAccount
               from   account a
               inner  join user_param b on (b.account_id = a.id and b.type_id = 2 and b.deleted is null)
               where  a.user_id = pUser and a.server_id = pServer and a.deleted is null and b.value = pAccount;
               for x in
                   select case
                            when lAccount is null then 0
                            else 1 
                          end as result, lAccount as login
               loop
                   r := row_to_json(x);  
               end loop;
            end if;
            return r;
          end;
          $$ language plpgsql STABLE`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
      await queryRunner.query(`drop function chooseAccount(integer, text, integer)`);
      await queryRunner.query(`drop function createAccount(integer, integer)`);
    }
}
