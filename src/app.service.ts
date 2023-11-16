import { Inject, Injectable } from '@nestjs/common';
import { users } from './entity/users';
import { Repository } from 'typeorm';
import { command_queue } from './entity/command_queue';

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
            locale: locale,
            chat_id: chat
           })
        .where("id = :id", {id: x[0].id})
        .execute();
      } else {
        const y = await this.service.createQueryBuilder("users")
        .insert()
        .into(users)
        .values({
          username: login,
          firstname: first_name,
          lastname: last_name,
          locale: locale,
          chat_id: chat
        })
        .returning('*')
        .execute();
        const id = y.generatedMaps[0].id;
        const z = await this.service.createQueryBuilder("command_queue")
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

  async getMenu(self, callback, curr, next) {
    try {
      const x = await this.service.query(
        `select a.id as user_id, b.id, b.message, a.chat_id
         from   users a
         inner  join action b on (b.id = a.action_id and b.type_id = 3)
         where  not a.scheduled is null
         order  by a.scheduled
         limit  1`);
      if (x && x.length > 0) {
         const chatId = x[0].chat_id;
         const text = x[0].message;
         const y = await this.service.query(
          `select a.id, a.message, a.order_num
           from   action a
           where  a.parent_id = $1 and a.type_id = 4
           order  by a.order_num`, [x[0].id]);
         let menu = [];
         for (let i = 0; i < y.length; i++) {
             menu.push([{
                text: y[i].message,
                callback_data: y[i].id
             }]);
         }
         await this.service.createQueryBuilder("users")
         .update(users)
         .set({ 
             action_id: null,
             scheduled: null
         })
         .where("id = :id", {id: x[0].user_id})
         .execute();
         if (menu.length > 0) {
             callback(self, curr, chatId, text, {
                reply_markup: {
                  inline_keyboard: menu
                }
             });
             return;
         }
      }
      callback(self, next, null, null, null);
    } catch (error) {
      console.error(error);
    }
  }
}
