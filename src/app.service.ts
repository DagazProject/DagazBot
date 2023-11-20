import { Inject, Injectable } from '@nestjs/common';
import { users } from './entity/users';
import { Repository } from 'typeorm';
import { command_queue } from './entity/command_queue';
import { user_param } from './entity/user_param';

@Injectable()
export class AppService {

  constructor(
    @Inject('USERS_REPOSITORY')
    private readonly service: Repository<users>
  ) {}  

  async getToken(self, callback) {
    try {
      const x = await this.service.query(
        `select b.value as token
         from   server a
         inner  join server_option b on (b.server_id = a.id)
         where  a.type_id = 1`);
      if (x && x.length > 0) {
         callback(self, x[0].token);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async getParamId(user_id: number, type_id: number): Promise<number> {
    const x = await this.service.query(
      `select id
       from   user_param a
       where  a.user_id = $1 and a.type_id = $1`, [user_id, type_id]);
    if (!x || x.length == 0) {
       return null;
    }
    return x[0].id;
  }

  async createUser(login: string, chat: number, first_name: string, last_name: string, locale: string) {
    try {
      const x = await this.service.query(
        `select id
         from   users
         where  username = $1`, [login]);
      if (x && x.length > 0) {
        await this.service.createQueryBuilder("users")
        .update(users)
        .set({ 
            updated: new Date(),
            firstname: first_name,
            lastname: last_name,
            chat_id: chat
           })
        .where("id = :id", {id: x[0].id})
        .execute();
        const id = await this.getParamId(x[0].id, 7);
        if (id) {
          await this.service.createQueryBuilder("user_param")
          .update(user_param)
          .set({ 
              created: new Date(),
              value: locale
             })
          .where("id = :id", {id: id})
          .execute();
          } else {
            await this.service.createQueryBuilder("user_param")
            .insert()
            .into(user_param)
            .values({
              type_id: 7,
              user_id: x[0].id,
              value: locale
            })
            .execute();
        }
      } else {
        const y = await this.service.createQueryBuilder("users")
        .insert()
        .into(users)
        .values({
          username: login,
          firstname: first_name,
          lastname: last_name,
          chat_id: chat
        })
        .returning('*')
        .execute();
        const id = y.generatedMaps[0].id;
        await this.service.createQueryBuilder("user_param")
        .insert()
        .into(user_param)
        .values({
          type_id: 7,
          user_id: id,
          value: locale
        })
        .execute();
        await this.service.createQueryBuilder("command_queue")
        .insert()
        .into(command_queue)
        .values({
          user_id: id,
          action_id: 201
        })
        .execute();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async getActions(self, callback, next) {
    try {
      const x = await this.service.query(
        `select x.id, x.user_id, x.action_id, x.created
         from ( select b.id, b.user_id, b.created, b.action_id,
                       row_number() over (partition by b.user_id order by b.created) as rn
                from   users a
                inner  join command_queue b on (b.user_id = a.id)
                where  a.action_id is null ) x
         where  x.rn = 1
         order  by x.created
         limit  10`);
      if (x && x.length > 0) {
          for (let i = 0; i < x.length; i++) {
            await this.service.createQueryBuilder("users")
            .update(users)
            .set({ 
                action_id: x[i].action_id,
                scheduled: new Date()
            })
            .where("id = :id", {id: x[i].user_id})
            .execute();
            await this.service.createQueryBuilder("command_queue")
            .delete()
            .from(command_queue)
            .where(`id  = :id`, {id: x[i].id})
            .execute();
          }
      }
      callback(self, next);
    } catch (error) {
      console.error(error);
    }
  }

  async getMenu(self, menucallback, callback, next) {
    try {
      const x = await this.service.query(
        `select a.id as user_id, b.id, a.chat_id,
                coalesce(c.message, d.message) as message,
                coalesce(c.locale, d.locale) as locale
         from   users a
         inner  join action b on (b.id = a.action_id and b.type_id = 3)
         left   join user_param u on (u.user_id = a.id and u.type_id = 7)
         left   join localized_string c on (c.action_id = b.id and c.locale = u.value)
         inner  join localized_string d on (d.action_id = b.id and d.locale = 'en')
         where  not a.scheduled < now()
         order  by a.scheduled
         limit  100`);
      if (x && x.length > 0) {
         for (let i = 0; i < x.length; i++) {
              const chatId = x[i].chat_id;
              const text = x[i].message;
              const y = await this.service.query(
             `select a.id, a.order_num,
                     coalesce(c.message, d.message) as message
              from   action a
              inner  join localized_string c on (c.action_id = a.id and c.locale = $1)
              where  a.parent_id = $2 and a.type_id = 4
              order  by a.order_num`, [x[i].locale, x[i].id]);
              let menu = [];
              for (let j = 0; j < y.length; j++) {
                  menu.push([{
                     text: y[j].message,
                     callback_data: y[j].id
                  }]);
              }
              await this.service.createQueryBuilder("users")
              .update(users)
              .set({ 
                  action_id: null,
                  scheduled: null
              })
              .where("id = :id", {id: x[i].user_id})
              .execute();
              if (menu.length > 0) {
                 await menucallback(chatId, text, {
                   reply_markup: {
                     inline_keyboard: menu
                   }
                });
            }
         }
      }
      callback(self, next);
    } catch (error) {
      console.error(error);
    }
  }

  async chooseItem(username, data) {
    try {
      const x = await this.service.query(
        `select a.id
         from   users a
         where  a.username = $1`, [username]);
      if (!x || x.length == 0) return;
      const y = await this.service.query(
        `select x.id
         from ( select a.id, row_number() over (order by a.order_num) as rn
                from   action a
                where  a.parent_id = $1) x
         where  x.rn = 1`, [data]);
      if (!y || y.length == 0) return;
      await this.service.createQueryBuilder("users")
      .update(users)
      .set({ 
          updated: new Date(),
          action_id: y[0].id
      })
      .where("id = :id", {id: x[0].id})
      .execute();
    } catch (error) {
      console.error(error);
    }
  }

  async getNextAction(id: number):Promise<number> {
    const x = await this.service.query(
      `select a.script_id, coalesce(a.parent_id, 0) as parent_id, a.order_num
       from   action a
       where  a.id = $1`, [id]);
    if (!x || x.length == 0) return null;
    const script_id = x[0].script_id;
    const parent_id = x[0].parent_id;
    const order_num = x[0].order_num;
    const y = await this.service.query(
      `select a.id
       from   action a
       where  a.script_id = $1 
       and    coalesce(a.prent_id, 0) = $2
       and    a.order_num > $3
       order  by a.order_num`, [x[0].script_id, x[0].parent_id, x[0].order_num]);
    if (!y || y.length == 0) return null;
    return y[0].id;
  }

  async setParams(self, callback, next) {
    try {
      const x = await this.service.query(
        `select a.id as user_id, b.id, b.paramtype_id, d.message
         from   users a
         inner  join action b on (b.id = a.action_id and b.type_id = 5)
         inner  join localized_string d on (d.action_id = b.id and d.locale = 'en')
         where  not a.scheduled < now()
         order  by a.scheduled
         limit  100`);
      if (!x || x.length == 0) return;
      for (let i = 0; i < x.length; i++) {
         const id = await this.getParamId(x[0].user_id, x[i].paramtype_id);
         if (id) {
            await this.service.createQueryBuilder("user_param")
            .update(user_param)
            .set({ 
                created: new Date(),
                value: x[i].message
            })
            .where("id = :id", {id: id})
            .execute();
           } else {
            await this.service.createQueryBuilder("user_param")
            .insert()
            .into(user_param)
            .values({
              type_id: x[i].paramtype_id,
              user_id: x[i].user_id,
              value: x[i].message
            })
            .execute();
         }
         const action = await this.getNextAction(x[i].id);
         await this.service.createQueryBuilder("users")
         .update(users)
         .set({ 
             updated: new Date(),
             action_id: action
         })
         .where("id = :id", {id: x[i].id})
         .execute();
      }
      callback(self, next);
    } catch (error) {
      console.error(error);
    }
  }

  async sendMessages(self, callback, next) {
    try {
      const x = await this.service.query(
        `select a.chat_id, b.id, coalesce(c.message, d.message) as message
         from   users a
         inner  join action b on (b.id = a.action_id and b.type_id = 1)
         left   join user_param u on (u.user_id = a.id and u.type_id = 7)
         left   join localized_string c on (c.action_id = b.id and c.locale = u.value)
         inner  join localized_string d on (d.action_id = b.id and d.locale = 'en')
         where  not a.scheduled < now()
         order  by a.scheduled
         limit  100`);
      if (!x || x.length == 0) return;
      for (let i = 0; i < x.length; i++) {
        await callback(x[i].chatId, x[i].message);
        const action = await this.getNextAction(x[i].id);
        await this.service.createQueryBuilder("users")
        .update(users)
        .set({ 
            updated: new Date(),
            action_id: action
        })
        .where("id = :id", {id: x[i].id})
        .execute();
      }
      callback(self, next);
    } catch (error) {
      console.error(error);
    }
  }
}
