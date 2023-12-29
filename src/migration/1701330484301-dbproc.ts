import {MigrationInterface, QueryRunner} from "typeorm";

export class dbproc1701330484301 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`create or replace function createAccount(
            in pUser integer,
            in pServer integer
          ) returns json
          as $$
          declare
            pLogin text;
            pAccount integer default null;
            r json;
            x record;
          begin
            select value into strict pLogin
            from   user_param
            where  user_id = pUser and type_id = 2;
            select max(a.id) into pAccount
            from   account a
            inner  join user_param b on (b.account_id = a.id)
            where  a.user_id = pUser and b.value = pLogin;
            if pAccount is null then
               insert into account(user_id, server_id)
               values (pUser, pServer)
               returning id into pAccount;  
            else
               delete from user_param
               where account_id = pAccount and type_id in (2, 3, 4);
            end if;
            update user_param set account_id = pAccount, user_id = null
            where user_id = pUser and type_id in (2, 3, 4);
            for x in
                select 1 result, pAccount as id
            loop
                r := row_to_json(x);  
            end loop;
            return r;
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
            if not lAccount is null then
               select e.value as pass into lPass
               from   account c
               inner  join user_param d on (d.account_id = c.id and d.type_id = 2 and d.value = lAccount)
               inner  join user_param e on (e.account_id = c.id and e.type_id = 3);
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
            lCommand integer;
          begin
            select url into strict u from server where id = pServer;
            for x in
                select id, data->>'user' as username, data->>'sid' as sid, 
                       data->>'url' as url, data->>'opponent' as player
                from   job_data
                where  job_id = pId and result_code = 200 and not data is null
                and    server_id = pServer
                order  by created
            loop
                for z in
                    select y.id as context_id, a.user_id, c.value as pass
                    from   account a
                    inner  join users u on (u.id = a.user_id)
                    inner  join common_context y on (y.id = u.context_id)
                    inner  join user_param b on (b.account_id = a.id and b.type_id = 2)
                    inner  join user_param c on (c.account_id = a.id and c.type_id = 3)
                    where  b.value = x.username and a.deleted is null
                loop
                    s := u || ',' || x.player || ',' || x.url || ',' || x.sid;
                    insert into command_queue(context_id, action_id, data)
                    values (z.context_id, 101, s)
                    returning id into lCommand;
                    insert into command_param(command_id, paramtype_id, value)
                    values(lCommand, 2, x.username);
                    insert into command_param(command_id, paramtype_id, value)
                    values(lCommand, 3, z.pass);
                end loop;
                delete from job_data where id = x.id;
            end loop;
            return 1;
          end;
          $$ language plpgsql VOLATILE`);
          await queryRunner.query(`create or replace function getCommands(
            ) returns integer
            as $$
            declare
              z record;
              t record;
              r integer default 0;
            begin
              for z in
                  select x.id, x.context_id, x.user_id, x.action_id, x.created, x.data
                  from ( select b.id, a.context_id, a.id as user_id, b.created, b.action_id, b.data,
                                row_number() over (partition by b.context_id order by b.created) as rn
                         from   common_context c
                         inner  join users a on (a.context_id = c.id)
                         inner  join command_queue b on (b.context_id = c.id)
                         where  c.action_id is null ) x
                  where  x.rn = 1
                  order  by x.created
              loop
                update common_context set action_id = z.action_id, scheduled = now()
                where  id = z.context_id;
                delete from user_param where user_id = z.user_id 
                and type_id in ( select paramtype_id
                                 from   clear_params
                                 where  coalesce(action_id, z.action_id) = z.action_id);
                if not z.data is null then
                   insert into user_param(type_id, user_id, value)
                   values (8, z.user_id, z.data);
                end if;
                for t in
                    select paramtype_id, value
                    from   command_param
                    where  command_id = z.id
                loop
                    insert into user_param(user_id, type_id, value)
                    values (z.user_id, t.paramtype_id, t.value);
                end loop;
                delete from command_param where command_id = z.id;
                delete from command_queue where id = z.id;
                r := r + 1;
              end loop;
              return r;
            end;
            $$ language plpgsql VOLATILE`);
            await queryRunner.query(`create or replace function createUser(
              in pLogin text,
              in pUserId bigint,
              in pChatId bigint,
              in pFirst text,
              in pLast text,
              in pLocale text
            ) returns integer
            as $$
            declare
               lUser integer;
               lCn integer;
               lCtx integer default null;
            begin
               select max(id), max(context_id) into lUser, lCtx from users where username = pLogin;
               if lCtx is null then
                  insert into common_context default values
                  returning id into lCtx;
               end if;
               if not lUser is null then
                  update users set updated = now(), firstname = pFirst, lastname = pLast, chat_id = pChatId, user_id = pUserId
                  where id = lUser;
               else
                  insert into users (username, firstname, lastname, chat_id, user_id, context_id)
                  values (pLogin, pFirst, pLast, pChatId, pUserId, lCtx)
                  returning id into lUser;
               end if;
               update user_param set created = now(), value = pLocale where user_id = lUser and type_id = 7;
               get diagnostics lCn = row_count;
               if lCn = 0 then
                  insert into user_param(type_id, user_id, value)
                  values (7, lUser, pLocale);
               end if;
               insert into command_queue(context_id, action_id) values (lCtx, 201);
               return lUser;
            end;
            $$ language plpgsql VOLATILE`);
            await queryRunner.query(`create or replace function setParams(
              ) returns integer
              as $$
              declare
                z record;
                q record;
                c integer default 0;
                p integer;
                n integer;
                a integer;
                s timestamp;
              begin
                for z in
                    select a.id as user_id, b.id, b.paramtype_id, d.message,
                           x.id as context_id
                    from   users a
                    inner  join common_context x on (x.id = a.context_id)
                    inner  join action b on (b.id = x.action_id and b.type_id = 5)
                    inner  join localized_string d on (d.action_id = b.id and d.locale = 'en')
                    where  x.scheduled < now()
                    order  by x.scheduled
                loop
                    update user_param set created = now(), value = z.message 
                    where user_id = z.user_id and type_id = z.paramtype_id;
                    get diagnostics n = row_count;
                    if n = 0 then
                       insert into user_param(type_id, user_id, value)
                       values (z.paramtype_id, z.user_id, z.message);
                    end if;
                    a := null;
                    for q in
                        select a.script_id, coalesce(a.parent_id, 0) as parent_id, a.order_num
                        from   action a
                        where  a.id = z.id
                    loop
                        select max(t.id) into a
                        from ( select a.id, row_number() over (order by a.order_num) as rn
                               from   action a
                               where  a.script_id = q.script_id
                               and    coalesce(a.parent_id, 0) = q.parent_id
                               and    a.order_num > q.order_num ) t
                        where t.rn = 1;
                        if a is null then
                           select max(t.id) into a
                           from ( select a.id, row_number() over (order by a.order_num) as rn
                                  from   action a
                                  where  a.script_id = q.script_id
                                  and    coalesce(a.parent_id, 0) = z.id ) t
                           where t.rn = 1;
                        end if;
                    end loop;
                    s := now();
                    if a is null then
                       s := null;
                    end if;
                    update common_context set scheduled = s, updated = now(), action_id = a
                    where id = z.context_id;
                    c := c + 1;
                end loop;
                return c;
              end;
              $$ language plpgsql VOLATILE`);
              await queryRunner.query(`create or replace function setParamValue(
                in pUser integer,
                in pCode integer,
                in pValue text
              ) returns integer
              as $$
              declare
                n integer;
              begin
                update user_param set created = now(), value = pValue
                where user_id = pUser and type_id = pCode;
                get diagnostics n = row_count;
                if n = 0 then
                   insert into user_param(type_id, user_id, value)
                   values (pCode, pUser, pValue);
                end if;
                return n;
              end;
              $$ language plpgsql VOLATILE`);
              await queryRunner.query(`create or replace function setActionByNum(
                in pUser integer,
                in pAction integer,
                in pNum integer
              ) returns integer
              as $$
              declare
                z record;
                c integer;
                lCtx integer;
              begin
                select context_id into strict lCtx 
                from users where id = pUser;
                for z in
                    select a.id
                    from   action a
                    where  a.parent_id = pAction and a.order_num = pNum
                loop
                    update common_context set scheduled = now(), updated = now(), action_id = z.id
                    where id = lCtx;
                    c := c + 1;
                end loop;
                return c;
              end;
              $$ language plpgsql VOLATILE`);
              await queryRunner.query(`create or replace function gameUrl(
                in pUser integer,
                in pServer integer
              ) returns json
              as $$
              declare
                lToken text default null;
                lUrl text default null;
                lData text;
                lPlayer text;
                r json;
                x record;
              begin
                select value into lToken from user_param where user_id = pUser and type_id = 11;
                select value into lData from user_param where user_id = pUser and type_id = 8;
                select url into lUrl from server where id = pServer;
                lPlayer := split_part(lData, ',', 2);
                for x in
                    select lUrl || '/redirect/' || lToken || '/' || split_part(lData, ',', 3) || '/' || split_part(lData, ',', 4) as url,
                           lPlayer as player,
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
              await queryRunner.query(`create or replace function saveMessage(
                in pLogin text,
                in pId bigint,
                in pData text,
                in pReply bigint
              ) returns json
              as $$
              declare
                z record;
                c integer;
              begin
                for z in
                    select a.id, coalesce(b.value, 'en') as locale
                    from   users a
                    left   join user_param b on (b.user_id = a.id and type_id = 7)
                    where  a.username = pLogin
                loop
                    insert into message(user_id, locale, message_id, data, reply_for)
                    values (z.id, z.locale, pId, pData, pReply);
                    c := c + 1;
                end loop;
                return c;
              end;
              $$ language plpgsql VOLATILE`);
              await queryRunner.query(`create or replace function saveProfile(
                in pUser integer,
                in pAccount text,
                in pServer integer
              ) returns json
              as $$
              declare
                lAccount integer;
                r json;
                x record;
              begin
                select a.id into strict lAccount
                from   account a
                inner  join user_param b on (b.account_id = a.id and b.type_id = 2)
                where  a.user_id = pUser and a.server_id = pServer and a.deleted is null
                and    pAccount = b.value;
                delete from user_param where account_id = lAccount and type_id in (4, 3);
                update user_param set account_id = lAccount, user_id = null where user_id = pUser and type_id = 4;
                update user_param set account_id = lAccount, user_id = null, type_id = 3 where user_id = pUser and type_id = 12;
                for x in
                    select 1 as result
                loop
                    r := row_to_json(x);  
                end loop;
                return r;
              end;
              $$ language plpgsql VOLATILE`);
              await queryRunner.query(`create or replace function addCommand(
                in pContext integer,
                in pAction integer
              ) returns integer
              as $$
              declare
                r integer;
              begin
                insert into command_queue(context_id, action_id) 
                values (pContext, pAction)
                returning id into r;
                return r;
              end;
              $$ language plpgsql VOLATILE`);
        }

    public async down(queryRunner: QueryRunner): Promise<any> {
      await queryRunner.query(`drop function addCommand(integer, integer)`);
      await queryRunner.query(`drop function saveProfile(integer, text, integer)`);
      await queryRunner.query(`drop function saveMessage(text, bigint, text, bigint)`);
      await queryRunner.query(`drop function gameUrl(integer, integer)`);
      await queryRunner.query(`drop function setActionByNum(integer, integer, integer)`);
      await queryRunner.query(`drop function setParamValue(integer, integer, text)`);
      await queryRunner.query(`drop function setParams()`);
      await queryRunner.query(`drop function createUser(text, bigint, text, text, text)`);
      await queryRunner.query(`drop function getCommands()`);
      await queryRunner.query(`drop function getNotify(integer, integer)`);
      await queryRunner.query(`drop function enterUrl(integer, integer)`);
      await queryRunner.query(`drop function chooseAccount(integer, text, integer)`);
      await queryRunner.query(`drop function createAccount(integer, integer)`);
    }
}
