import { HttpService, Inject, Injectable } from '@nestjs/common';
import { users } from './entity/users';
import { Repository } from 'typeorm';
import { command_queue } from './entity/command_queue';
import { user_param } from './entity/user_param';
import { message } from './entity/message';

const BOT_DEVICE = 'telegram';

@Injectable()
export class AppService {

  constructor(
    @Inject('USERS_REPOSITORY')
    private readonly service: Repository<users>,
    private httpService: HttpService
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

  async getCommands() {
    try {
      let r = [];
      const x = await this.service.query(
        `select x.command, x.action_id
         from ( select a.command, b.id as action_id,
                       row_number() over (partition by a.id order by b.order_num) rn
                from   script a
                inner  join action b on (b.script_id = a.id and b.parent_id is null)
                where  not a.command is null ) x
         where  x.rn = 1`);
         if (x && x.length > 0) {
             for (let i = 0; i < x.length; i++) {
                 r.push({
                    name: x[i].command,
                    action: x[i].action_id
                 });
             }
         }
      return r;
    } catch (error) {
      console.error(error);
    }
  }

  async getUserId(username: string): Promise<number> {
    const x = await this.service.query(
      `select id
       from   users a
       where  a.username = $1`, [username]);
    if (!x || x.length == 0) {
       return null;
    }
    return x[0].id;
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

  async addAction(username, action) {
    try {
      const id = await this.getUserId(username);
      await this.service.createQueryBuilder("command_queue")
      .insert()
      .into(command_queue)
      .values({
        user_id: id,
        action_id: action
      })
      .execute();
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
         where  a.scheduled < now()
         order  by a.scheduled
         limit  100`);
      if (x && x.length > 0) {
         for (let i = 0; i < x.length; i++) {
              const y = await this.service.query(
             `select a.id, a.order_num, c.message
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
                 await menucallback(x[i].chat_id, x[i].message, {
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
          scheduled: new Date(),
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
    const y = await this.service.query(
      `select a.id
       from   action a
       where  a.script_id = $1 
       and    coalesce(a.parent_id, 0) = $2
       and    a.order_num > $3
       order  by a.order_num`, [x[0].script_id, x[0].parent_id, x[0].order_num]);
    if (y && y.length > 0) return y[0].id;
    const z = await this.service.query(
      `select a.id
       from   action a
       where  a.script_id = $1 
       and    coalesce(a.parent_id, 0) = $2
       order  by a.order_num`, [x[0].script_id, id]);
    if (!z || z.length == 0) return null;
    return z[0].id;
  }

  async setParams(self, callback, next) {
    try {
      const x = await this.service.query(
        `select a.id as user_id, b.id, b.paramtype_id, d.message
         from   users a
         inner  join action b on (b.id = a.action_id and b.type_id = 5)
         inner  join localized_string d on (d.action_id = b.id and d.locale = 'en')
         where  a.scheduled < now()
         order  by a.scheduled
         limit  100`);
      if (x && x.length > 0) {
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
              scheduled: action ? new Date() : null,
              updated: new Date(),
              action_id: action
          })
          .where("id = :id", {id: x[i].id})
          .execute();
       }
      }
      callback(self, next);
    } catch (error) {
      console.error(error);
    }
  }

  async sendInfo(self, send, callback, next) {
    try {
      const x = await this.service.query(
        `select a.chat_id, b.id, coalesce(c.message, d.message) as message, b.follow_to, a.id as user_id
         from   users a
         inner  join action b on (b.id = a.action_id and b.type_id = 1)
         left   join user_param u on (u.user_id = a.id and u.type_id = 7)
         left   join localized_string c on (c.action_id = b.id and c.locale = u.value)
         inner  join localized_string d on (d.action_id = b.id and d.locale = 'en')
         where  a.scheduled < now()
         order  by a.scheduled
         limit  100`);
      if (x && x.length > 0) {
        for (let i = 0; i < x.length; i++) {
          await send(x[i].chat_id, x[i].message);
          let action = x[i].follow_to;
          if (!action) {
              action = await this.getNextAction(x[i].id);
          }
          await this.service.createQueryBuilder("users")
          .update(users)
          .set({ 
              scheduled: action ? new Date() : null,
              updated: new Date(),
              action_id: action
          })
          .where("id = :id", {id: x[i].user_id})
          .execute();
        }
      }
      callback(self, next);
    } catch (error) {
      console.error(error);
    }
  }

  async getParams(self, send, callback, next) {
    try {
      const x = await this.service.query(
        `select a.chat_id, a.id, b.paramtype_id, coalesce(c.message, d.message) as message
         from   users a
         inner  join action b on (b.id = a.action_id and b.type_id = 2)
         left   join user_param u on (u.user_id = a.id and u.type_id = 7)
         left   join localized_string c on (c.action_id = b.id and c.locale = u.value)
         inner  join localized_string d on (d.action_id = b.id and d.locale = 'en')
         where  a.scheduled < now() and a.wait_for is null
         order  by a.scheduled
         limit  100`);
      if (x && x.length > 0) {
         for (let i = 0; i < x.length; i++) {
            await send(x[i].chat_id, x[i].message);
            await this.service.createQueryBuilder("users")
            .update(users)
            .set({ 
                scheduled: null,
                wait_for: x[i].paramtype_id,
                updated: new Date(),
            })
            .where("id = :id", {id: x[i].id})
            .execute();
         }
      }
      callback(self, next);
    } catch (error) {
      console.error(error);
    }
  }

  async saveParam(username, data): Promise<boolean> {
    try {
      const x = await this.service.query(
        `select a.id as user_id, a.wait_for, b.id, a.action_id
         from   users a
         left   join user_param b on (b.user_id = a.id and b.type_id = a.wait_for)
         where  a.username = $1 and not a.wait_for is null`, [username]);
      if (!x || x.length == 0) return false;
      const action = await this.getNextAction(x[0].action_id);
      if (x[0].id) {
        await this.service.createQueryBuilder("user_param")
        .update(user_param)
        .set({ 
            created: new Date(),
            value: data
           })
        .where("id = :id", {id: x[0].id})
        .execute();
      } else {
        await this.service.createQueryBuilder("user_param")
        .insert()
        .into(user_param)
        .values({
          type_id: x[0].wait_for,
          user_id: x[0].user_id,
          value: data
        })
        .execute();
      }
      await this.service.createQueryBuilder("users")
      .update(users)
      .set({ 
          wait_for: null,
          scheduled: action ? new Date() : null,
          updated: new Date(),
          action_id: action
      })
      .where("id = :id", {id: x[0].user_id})
      .execute();
      return true;
    } catch (error) {
      console.error(error);
    }
  }

  async saveMessage(username: string, id: number, data: string) {
    try {
      const x = await this.service.query(
        `select a.id, coalesce(b.value, 'en') as locale
         from   users a
         left   join user_param b on (b.user_id = a.id and type_id = 7)
         where  a.username = $1`, [username]);
      if (!x || x.length == 0) return;
      await this.service.createQueryBuilder("message")
      .insert()
      .into(message)
      .values({
        user_id: x[0].id,
        locale: x[0].locale,
        message_id: id,
        data: data
      })
      .execute();
    } catch (error) {
      console.error(error);
    }
  }

  async sendMessages(self, send, callback, next) {
    try {
      const x = await this.service.query(
        `select a.id, a.send_to, a.locale, a.data, b.is_admin
         from   message a
         left   join users b on (b.id = a.user_id)
         where  a.scheduled < now()
         order  by a.scheduled
         limit  1`);
      if (x && x.length > 0) {
        if (x[0].send_to) {
            const y = await this.service.query(
              `select a.chat_id
               from   users a
               where  a.id = $1`, [x[0].send_to]);
               if (y && y.length > 0) {
                  await send(y[0].chat_id, x[0].data);
               }
        } else {
            if (x[0].is_admin) {
                const y = await this.service.query(
                  `select a.chat_id
                   from   users a
                   left   join user_param b on (b.user_id = a.id and type_id = 7)
                   where  coalesce(b.value, 'en') = $1 `, [x[0].locale]);
                if (y && y.length > 0) {
                   for (let i = 0; i < y.length; i++) {
                    await send(y[i].chat_id, x[0].data);
                  }
                }
            } else {
                const y = await this.service.query(
                  `select a.chat_id
                   from   users a
                   where  a.is_admin`);
                if (y && y.length > 0) {
                   for (let i = 0; i < y.length; i++) {
                     await send(y[i].chat_id, x[0].data);
                   }
                }
            }
        }
        await this.service.createQueryBuilder("message")
        .update(message)
        .set({ 
            scheduled: null
        })
        .where("id = :id", {id: x[0].id})
        .execute();
      }
      callback(self, next);
    } catch (error) {
      console.error(error);
    }
  }

  async parseResponse(userId, actionId, response, result) {
    if (result.params) {
      for (let i = 0; i < result.params.length; i++) {
        if (response.data[0][result.params[i].name]) {
            await this.setParamValue(userId, result.params[i].code, response.data[0][result.params[i].name]);
        }
     }
    }
    if (result.num) {
        await this.setNextAction(userId, actionId, result.num);
    }
  }

  async http(userId, requestId, actionId, type, url, body) {
    if (type == 'GET') {
        this.httpService.get(url)
        .subscribe(async response => {
          const result = await this.getResponse(requestId, response.status);
          if (result) {
             await this.parseResponse(userId, actionId, response, result);
          } else {
             console.info(response);
          }
        }, async error => {
           if (!error.response) {
             console.error(error);
             return; 
          }
           const result = await this.getResponse(requestId, error.response.status);
          if (result) {
              await this.parseResponse(userId, actionId, error.response, result);
          } else {
            console.error(error);
          }
        });
    } else {
      this.httpService.post(url, body)
      .subscribe(async response => {
        const result = await this.getResponse(requestId, response.status);
        if (result) {
          await this.parseResponse(userId, actionId, response, result);
        } else {
          console.info(response);
        }
      }, async error => {
        if (!error.response) {
           console.error(error);
           return; 
        }
        const result = await this.getResponse(requestId, error.response.status);
        if (result) {
          await this.parseResponse(userId, actionId, error.response, result);
        } else {
          console.error(error);
        }
      });
    }
  }

  async httpRequest(self, callback, next) {
    try {
      const x = await this.service.query(
        `select a.id as user_id, d.id as request_id, b.id as action_id, d.request_type,
                e.api || d.url as url
         from   users a
         inner  join action b on (b.id = a.action_id)
         inner  join action_type c on (c.id = b.type_id)
         inner  join request d on (d.actiontype_id = c.id)
         inner  join server e on (e.id = d.server_id)
         where  a.scheduled < now()
         order  by a.scheduled
         limit  100`);
      if (x && x.length > 0) {
         let body = {};
         const y = await this.service.query(
          `select a.param_name, b.value
           from   request_param a
           left   join user_param b on (b.type_id = a.paramtype_id and b.user_id = $1)
           where  a.request_id = $2`, [x[0].user_id, x[0].request_id]);
         if (y && y.length > 0) {
            for (let i = 0 ; i < y.length; i++) {
              body[y[i].param_name] = y[i].value;
            }
            body['device'] = BOT_DEVICE;
         }
         await this.http(x[0].user_id, x[0].request_id, x[0].action_id, x[0].request_type, x[0].url, body);
      }
      callback(self, next);
    } catch (error) {
      console.error(error);
    }
  }

  async getResponse(reuestId: number, httpCode: number):Promise<any> {
    try {
      const x = await this.service.query(
        `select a.id, a.order_num
         from   response a
         where  a.request_id = $1 and a.result_code = $2`, [reuestId, httpCode]);
      if (!x || x.length == 0) return null;
      const y = await this.service.query(
        `select a.paramtype_id as code, a.param_name as name
         from   response_param a
         where  a.response_id = $1`, [x[0].id]);
      let params = [];
      if (y && y.length > 0) {
         for (let i = 0; i < y.length; i++) {
             params.push({
               code: y[i].code,
               name: y[i].name
             });
         }
      }
      return {
        num: x[0].order_num,
        params: params
      };
    } catch (error) {
      console.error(error);
    }
  }

  async setParamValue(userId:number, paramCode: number, paramValue: string) {
    try {
      const x = await this.service.query(
        `select a.id
         from   user_param a
         where  user_id = $1 and type_id = $2`, [userId, paramCode]);
      if (x && x.length > 0) {
        await this.service.createQueryBuilder("user_param")
        .update(user_param)
        .set({ 
            created: new Date(),
            value: paramValue
           })
        .where("id = :id", {id: x[0].id})
        .execute();
      } else {
        await this.service.createQueryBuilder("user_param")
        .insert()
        .into(user_param)
        .values({
          type_id: paramCode,
          user_id: userId,
          value: paramValue
        })
        .execute();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async setNextAction(userId: number, actionId: number, num: number) {
    try {
      const x = await this.service.query(
        `select a.id
         from   action a
         where  a.parent_id = $1 and a.order_num = $2`, [actionId, num]);
      if (!x || x.length == 0) return;
      await this.service.createQueryBuilder("users")
      .update(users)
      .set({ 
          scheduled: new Date(),
          updated: new Date(),
          action_id: x[0].id
      })
      .where("id = :id", {id: userId})
      .execute();
    } catch (error) {
      console.error(error);
    }
  }

  async dbProc(self, callback, next) {
    try {
      const x = await this.service.query(
        `select a.id as user_id, d.id as proc_id, b.id as action_id, d.name as proc_name
         from   users a
         inner  join action b on (b.id = a.action_id)
         inner  join action_type c on (c.id = b.type_id)
         inner  join dbproc d on (d.actiontype_id = c.id)
         where  a.scheduled < now()
         order  by a.scheduled
         limit  100`);
      if (x && x.length > 0) {
         let params = [x[0].user_id];
         let sql = 'select ' + x[0].proc_name + '($1';
         const y = await this.service.query(
            `select a.order_num, coalesce(b.value, a.value) as value
             from  db_param a
             left  join user_param b on (b.type_id = a.param_type_id and b.user_id = $1)
             where a.proc_id = $2
             order by a.order_num`, [x[0].user_id, x[0].proc_id]);
         if (y && y.length > 0) {
             for (let i = 0; i < y.length; i++) {
                  sql = sql + ',$' + y[i].order_num;
                  params.push(y[i].value);
             }
         }
         sql = sql + ') as value';
         await this.service.query(sql, params);
         // TODO: db_result

         const action = await this.getNextAction(x[0].action_id);
         await this.service.createQueryBuilder("users")
         .update(users)
         .set({ 
             scheduled: action ? new Date() : null,
             updated: new Date(),
             action_id: action
         })
         .where("id = :id", {id: x[0].user_id})
         .execute();
        }
        callback(self, next);
    } catch (error) {
      console.error(error);
    }
  }
}
