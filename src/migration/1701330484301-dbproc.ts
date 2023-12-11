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
            lPass text default null;
          begin
            select string_agg(b.value, ',') into lAccount
            from   account a
            inner  join user_param b on (b.account_id = a.id and b.type_id = 2)
            where  a.user_id = pUser and a.server_id = pServer and a.deleted is null
            and    coalesce(pAccount, b.value) = b.value;
            if not pAccount is null then
               select b.pass into lPass
               from   user_param a
               inner  join ( 
                      select c.user_id, e.value as pass
                      from   account c
                      inner  join user_param d on (d.account_id = c.id and d.type_id = 2 and d.value = pAccount)
                      inner  join user_param e on (e.account_id = c.id and e.type_id = 3)
               ) b on (b.user_id = a.user_id)
               where  a.value = pAccount and a.type_id = 2 and a.user_id = pUser;
            end if;
            for x in
               select case
                  when lAccount is null then 0
                  when strpos(lAccount, ',') = 0 then 1
                  else 2 
               end as result, lAccount as login, lPass as password
            loop
               r := row_to_json(x);  
            end loop;
            return r;
          end;
          $$ language plpgsql STABLE`);
          await queryRunner.query(`create or replace function enterUrl(
            in pUser integer,
            in pServer integer
          ) returns json
          as $$
          declare
            lToken text default null;
            lUrl text default null;
            r json;
            x record;
          begin
            select value into lToken
            from   user_param
            where  user_id = pUser and type_id = 11;
            select url into lUrl
            from   server
            where  id = pServer;
            for x in
                select lUrl || '/redirect/' || lToken as url,
                  case
                    when lUrl is null or lToken is null then 0
                    else 1
                  end as result
            loop
                r := row_to_json(x);  
            end loop;
            delete from user_param where user_id = pUser and type_id in (2, 3, 11);
            return r;
          end;
          $$ language plpgsql VOLATILE`);
          await queryRunner.query(`create or replace function getNotify(
            in pId integer,
            in pServer integer
          ) returns integer
          as $$
          declare
            x record;
            z record;
            s text;
            u text;
            c integer;
          begin
            select url into strict u from server where id = pServer;
            for x in
                select data->>'user' as username, data->>'sid' as sid, 
                       data->>'url' as url, data->>'opponent' as player
                from   job_data
                where  job_id = pId and result_code = 200 and not data is null
                order  by created
            loop
                for z in
                    select a.user_id
                    from   account a
                    inner  join user_param b on (b.account_id = a.id and b.type_id = 2)
                    where  b.value = x.username and a.deleted is null
                loop
                    s := u || ',' || x.player || ',' || x.url || ',' || x.sid;
                    insert into command_queue(user_id, action_id, data)
                    values (z.user_id, 101, s);
                end loop;
            end loop;
          end;
          $$ language plpgsql VOLATILE`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
      await queryRunner.query(`drop function getNotify(integer, integer)`);
      await queryRunner.query(`drop function enterUrl(integer, integer)`);
      await queryRunner.query(`drop function chooseAccount(integer, text, integer)`);
      await queryRunner.query(`drop function createAccount(integer, integer)`);
    }
}
