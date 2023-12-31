import { HttpService, Inject, Injectable } from '@nestjs/common';
import { users } from './entity/users';
import { Repository } from 'typeorm';
import { user_param } from './entity/user_param';
import { message } from './entity/message';
import { job_data } from './entity/job_data';
import { client_message } from './entity/client_message';
import { common_context } from './entity/common_context';
import { command_param } from './entity/command_param';

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
         where  a.type_id = 1
         order  by a.id
         limit  1`);
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
        `select x.command, x.action_id, x.script_id, x.name
         from ( select a.command, b.id as action_id, a.id as script_id, a.name,
                       row_number() over (partition by a.id order by b.order_num) rn
                from   script a
                inner  join action b on (b.script_id = a.id and b.parent_id is null)
                where  not a.command is null ) x
         where  x.rn = 1`);
         if (x && x.length > 0) {
             for (let i = 0; i < x.length; i++) {
                 let p = [];
                 const y = await this.service.query(
                  `select a.paramtype_id
                   from   script_param a
                   where  a.script_id = $1
                   order  by a.order_num`, [x[i].script_id]);
                 if (y && y.length > 0) {
                     for (let j = 0; j < y.length; j++) {
                          p.push(y[j].paramtype_id);
                     }
                 }
                 r.push({
                    name: x[i].command,
                    descr: x[i].name,
                    action: x[i].action_id,
                    params: p
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

  async getContextId(username: string): Promise<number> {
    const x = await this.service.query(
      `select context_id
       from   users a
       where  a.username = $1`, [username]);
    if (!x || x.length == 0) {
       return null;
    }
    return x[0].context_id;
  }

  async addAction(username, action, params) {
    try {
      const id = await this.getContextId(username);
      await this.service.query(`select clearActivity($1)`, [id]);
      const x = await this.service.query(`select addCommand($1, $2) as id`, [id, action]);
      if (!x || x.length == 0) return;
      for (let i = 0; i < params.length; i++) {
        await this.service.createQueryBuilder("command_param")
        .insert()
        .into(command_param)
        .values({
          command_id: x[0].id,
          paramtype_id: params[i].id,
          value: params[i].value
        })
        .execute();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async createUser(login: string, user: number, chat: number, first_name: string, last_name: string, locale: string) {
    try {
      await this.service.query(`select createUser($1, $2, $3, $4, $5, $6)`, [login, user, chat, first_name, last_name, locale]);
    } catch (error) {
      console.error(error);
    }
  }

  async getActions(): Promise<boolean> {
    try {
      const x = await this.service.query(`select getCommands() as n`);
      if (!x || x.length == 0 || x[0].n) return false;
      return true;
    } catch (error) {
      console.error(error);
    }
  }

  async getVirtualMenu(menucallback): Promise<boolean> {
    try {
      const x = await this.service.query(
        `select a.id as user_id, b.id, a.chat_id,
                coalesce(c.message, d.message) as message, e.value,
                x.id as context_id, coalesce(p.value, 1) as width
         from   users a
         inner  join common_context x on (x.id = a.context_id)
         inner  join action b on (b.id = x.action_id and b.type_id = 6)
         left   join action_param p on (p.action_id = b.id and p.type_id = 13)
         left   join user_param u on (u.user_id = a.id and u.type_id = 7)
         left   join localized_string c on (c.action_id = b.id and c.locale = u.value)
         inner  join localized_string d on (d.action_id = b.id and d.locale = 'en')
         inner  join user_param e on (e.user_id = a.id and e.type_id = b.paramtype_id)
         where  x.scheduled < now()
         order  by x.scheduled
         limit  100`);
      if (!x || x.length == 0) return false;
      for (let i = 0; i < x.length; i++) {
        const list = x[i].value.split(/,/);
        let menu = []; let row = [];
        for (let j = 0; j < list.length; j++) {
            if (row.length >= x[i].width) {
               menu.push(row);
               row = [];
            }
            row.push({
              text: list[j],
              callback_data: list[j]
            });
         }
         if (row.length > 0) {
            menu.push(row);
         }
         let msg = null;
         if (menu.length > 0) {
           msg = await menucallback(x[i].chat_id, x[i].message, {
             reply_markup: {
               inline_keyboard: menu
             }
          });
        }
        await this.service.createQueryBuilder("common_context")
        .update(common_context)
        .set({ 
            delete_message: msg.message_id,
            scheduled: null
        })
        .where("id = :id", {id: x[i].context_id})
        .execute();
    }
     return true;
  } catch (error) {
      console.error(error);
    }
  }

  async getMenu(menucallback): Promise<boolean> {
    try {
      const x = await this.service.query(
        `select a.id as user_id, b.id, a.chat_id,
                coalesce(c.message, d.message) as message,
                coalesce(c.locale, d.locale) as locale,
                x.id as context_id, coalesce(p.value, 1) as width
         from   users a
         inner  join common_context x on (x.id = a.context_id)
         inner  join action b on (b.id = x.action_id and b.type_id = 3)
         left   join action_param p on (p.action_id = b.id and p.type_id = 13)
         left   join user_param u on (u.user_id = a.id and u.type_id = 7)
         left   join localized_string c on (c.action_id = b.id and c.locale = u.value)
         inner  join localized_string d on (d.action_id = b.id and d.locale = 'en')
         where  x.scheduled < now()
         order  by x.scheduled
         limit  100`);
      if (!x || x.length == 0) return false;
      for (let i = 0; i < x.length; i++) {
        const y = await this.service.query(
       `select a.id, a.order_num, c.message
        from   action a
        inner  join localized_string c on (c.action_id = a.id and c.locale = $1)
        where  a.parent_id = $2
        order  by a.order_num`, [x[i].locale, x[i].id]);
        let menu = []; let row = [];
        for (let j = 0; j < y.length; j++) {
            if (row.length >= x[i].width) {
               menu.push(row);
               row = [];
            }
            row.push({
              text: y[j].message,
              callback_data: y[j].id
            });
        }
        if (row.length > 0) {
          menu.push(row);
        }
        let msg = null;
        if (menu.length > 0) {
           msg = await menucallback(x[i].chat_id, x[i].message, {
             reply_markup: {
               inline_keyboard: menu
             }
          });
        }
        await this.service.createQueryBuilder("common_context")
        .update(common_context)
        .set({ 
            delete_message: msg.message_id,
            action_id: null,
            scheduled: null
        })
        .where("id = :id", {id: x[i].context_id})
        .execute();
     }
     return true;
  } catch (error) {
      console.error(error);
    }
  }

  async chooseItem(username, data, chatId, del) {
    try {
      const x = await this.service.query(
        `select a.id, b.paramtype_id, b.follow_to, x.delete_message,
                x.id as context_id
         from   users a
         inner  join common_context x on (x.id = a.context_id)
         left   join action b on (b.id = x.action_id and b.type_id = 6)
         where  a.username = $1`, [username]);
      if (!x || x.length == 0) return;
      let action = x[0].follow_to;
      if (x[0].paramtype_id) {
        await this.service.createQueryBuilder("user_param")
        .update(user_param)
        .set({ 
            created: new Date(),
            value: data
        })
        .where("user_id = :id and type_id = :tp", {id: x[0].id, tp: x[0].paramtype_id})
        .execute();
      } else {
        const y = await this.service.query(
          `select x.id
           from ( select a.id, row_number() over (order by a.order_num) as rn
                  from   action a
                  where  a.parent_id = $1) x
           where  x.rn = 1`, [data]);
        if (y && y.length > 0) {
           action = y[0].id;
        }
      }
      if (x[0].delete_message) {
        del(chatId, x[0].delete_message);
      }
      await this.service.createQueryBuilder("common_context")
      .update(common_context)
      .set({ 
          delete_message: null,
          scheduled: action ? new Date() : null,
          action_id: action
       })
      .where("id = :id", {id: x[0].context_id})
      .execute();
    } catch (error) {
      console.error(error);
    }
  }

  async getNextAction(id: number, isParent: boolean):Promise<number> {
    const x = await this.service.query(
      `select a.script_id, coalesce(a.parent_id, 0) as parent_id, a.order_num
       from   action a
       where  a.id = $1`, [id]);
    if (!x || x.length == 0) return null;
    if (isParent) {
      const z = await this.service.query(
        `select a.id
         from   action a
         where  a.script_id = $1 
         and    coalesce(a.parent_id, 0) = $2
         order  by a.order_num`, [x[0].script_id, id]);
      if (z && z.length > 0) return z[0].id;
    }
    const y = await this.service.query(
      `select a.id
       from   action a
       where  a.script_id = $1 
       and    coalesce(a.parent_id, 0) = $2
       and    a.order_num > $3
       order  by a.order_num`, [x[0].script_id, x[0].parent_id, x[0].order_num]);
    if (!y || y.length == 0) return null;
    return y[0].id;
  }

  async setParams(): Promise<boolean> {
    try {
      const x = await this.service.query(`select setParams() as n`);
      if (!x || x.length == 0 || x[0].n == 0) return false;
      return true;
  } catch (error) {
      console.error(error);
    }
  }

  async replacePatterns(user_id: number, s: string): Promise<string> {
    let r = s.match(/{(\S+)}/);
    while (r) {
      const name = r[1];
      const x = await this.service.query(
        `select b.value
         from   param_type a
         left   join user_param b on (b.type_id = a.id and b.user_id = $1)
         where  a.name = $2`, [user_id, name]);
      let v = '';
      if (x && x.length > 0) v = x[0].value;
      s = s.replace('{' + name + '}', v);
      r = s.match(/{(\S+)}/);
    }
    return s;
  }

  async sendInfo(send): Promise<boolean> {
    try {
      const x = await this.service.query(
        `select a.chat_id, b.id, coalesce(c.message, d.message) as message, 
                b.follow_to, a.id as user_id, e.value as data,
                x.id as context_id
         from   users a
         inner  join common_context x on (x.id = a.context_id)
         inner  join action b on (b.id = x.action_id and b.type_id = 1)
         left   join user_param u on (u.user_id = a.id and u.type_id = 7)
         left   join localized_string c on (c.action_id = b.id and c.locale = u.value)
         left   join localized_string d on (d.action_id = b.id and d.locale = 'en')
         left   join user_param e on (e.user_id = a.id and e.type_id = b.paramtype_id)
         where  x.scheduled < now()
         order  by x.scheduled
         limit  100`);
      if (!x || x.length == 0) return false;
      for (let i = 0; i < x.length; i++) {
        let message = x[i].message;
        message = await this.replacePatterns(x[i].user_id, message);
        await send(x[i].chat_id, message);
        let action = x[i].follow_to;
        if (!action) {
            action = await this.getNextAction(x[i].id, false);
        }
        await this.service.createQueryBuilder("common_context")
        .update(common_context)
        .set({ 
            scheduled: action ? new Date() : null,
            action_id: action
        })
        .where("id = :id", {id: x[i].context_id})
        .execute();
      }
      return true;
    } catch (error) {
      console.error(error);
    }
  }

  async getParams(send): Promise<boolean> {
    try {
      const x = await this.service.query(
        `select a.chat_id, a.id, b.paramtype_id, coalesce(c.message, d.message) as message,
                x.id as context_id
         from   users a
         inner  join common_context x on (x.id = a.context_id)
         inner  join action b on (b.id = x.action_id and b.type_id = 2)
         left   join user_param u on (u.user_id = a.id and u.type_id = 7)
         left   join localized_string c on (c.action_id = b.id and c.locale = u.value)
         inner  join localized_string d on (d.action_id = b.id and d.locale = 'en')
         where  x.scheduled < now() and x.wait_for is null
         order  by x.scheduled
         limit  100`);
      if (!x || x.length == 0) return false;
      for (let i = 0; i < x.length; i++) {
        let message = x[i].message;
        message = await this.replacePatterns(x[i].id, message);
        await send(x[i].chat_id, message);
        await this.service.createQueryBuilder("common_context")
        .update(common_context)
        .set({ 
            scheduled: null,
            wait_for: x[i].paramtype_id
         })
        .where("id = :id", {id: x[i].context_id})
        .execute();
     }
     return true;
  } catch (error) {
      console.error(error);
    }
  }

  async saveParam(username, data, chatId, msgId, del): Promise<boolean> {
    try {
      const x = await this.service.query(
        `select a.id as user_id, x.wait_for, b.id, x.action_id, c.is_hidden,
                x.id as context_id
         from   users a
         inner  join common_context x on (x.id = a.context_id)
         left   join user_param b on (b.user_id = a.id and b.type_id = x.wait_for)
         inner  join param_type c on (c.id = x.wait_for)
         where  a.username = $1 and not x.wait_for is null`, [username]);
      if (!x || x.length == 0) return false;
      const action = await this.getNextAction(x[0].action_id, true);
      await this.service.query(`select setParamValue($1, $2, $3)`, [x[0].user_id, x[0].wait_for, data]);
      if (x[0].is_hidden) {
        await del(chatId, msgId);
      }
      await this.service.createQueryBuilder("common_context")
      .update(common_context)
      .set({ 
          wait_for: null,
          scheduled: action ? new Date() : null,
          action_id: action
      })
      .where("id = :id", {id: x[0].context_id})
      .execute();
      return true;
    } catch (error) {
      console.error(error);
    }
  }

  async saveMessage(username: string, id: number, data: string, reply) {
    try {
      if (data.length > 1024) return;
      let reply_id = null;
      if (reply) {
          const x = await this.service.query(
            `select b.message_id
             from   client_message a
             inner  join message b on (b.id = a.parent_id)
             where  a.message_id = $1`, [reply.message_id]);
          if (x && x.length > 0) {
             reply_id = x[0].message_id;
          }
        }
      await this.service.query(`select saveMessage($1, $2, $3, $4)`, [username, id, data, reply_id]);
    } catch (error) {
      console.error(error);
    }
  }

  async sendMessages(send): Promise<boolean> {
    try {
      const x = await this.service.query(
        `select a.id, a.send_to, a.locale, a.data, b.is_admin, a.reply_for
         from   message a
         left   join users b on (b.id = a.user_id)
         where  a.scheduled < now()
         order  by a.scheduled
         limit  1`);
      if (!x || x.length == 0) return false;
      if (x[0].send_to) {
        const y = await this.service.query(
          `select a.chat_id, b.id
           from   users a
           left   join message b on (b.user_id = a.id and b.message_id = $1)
           where  a.id = $2`, [x[0].reply_for, x[0].send_to]);
           if (y && y.length > 0 && (!x[0].reply_for || y[0].id)) {
             const msg = await send(y[0].chat_id, x[0].data, x[0].reply_for);
             if (msg) {
              await this.service.createQueryBuilder("client_message")
              .insert()
              .into(client_message)
              .values({
                parent_id: x[0].id,
                message_id: msg.message_id
              })
              .execute();
           }
       }
      } else {
        if (x[0].is_admin) {
            const y = await this.service.query(
              `select a.chat_id, c.id
               from   users a
               left   join user_param b on (b.user_id = a.id and type_id = 7)
               left   join message c on (c.user_id = a.id and c.message_id = $1)
               where  coalesce(b.value, 'en') = $2 `, [x[0].reply_for, x[0].locale]);
            if (y && y.length > 0) {
               for (let i = 0; i < y.length; i++) {
                if (!x[0].reply_for || y[i].id) {
                  const msg = await send(y[i].chat_id, x[0].data, x[0].reply_for);
                  if (msg) {
                    await this.service.createQueryBuilder("client_message")
                    .insert()
                    .into(client_message)
                    .values({
                      parent_id: x[0].id,
                      message_id: msg.message_id
                    })
                    .execute();
                  }
                }
              }
            }
        } else {
            const y = await this.service.query(
              `select a.chat_id, b.id
               from   users a
               left   join message b on (b.user_id = a.id and b.message_id = $1)
               where  a.is_admin`, [x[0].reply_for]);
            if (y && y.length > 0) {
               for (let i = 0; i < y.length; i++) {
                if (!x[0].reply_for || y[i].id) {
                  const msg = await send(y[i].chat_id, x[0].data, x[0].reply_for);
                  if (msg) {
                    await this.service.createQueryBuilder("client_message")
                    .insert()
                    .into(client_message)
                    .values({
                      parent_id: x[0].id,
                      message_id: msg.message_id
                    })
                    .execute();
                  }
                }
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
    return true;
  } catch (error) {
      console.error(error);
    }
  }

  async parseResponse(userId, actionId, response, result) {
    if (result.params) {
      for (let i = 0; i < result.params.length; i++) {
        if (response.data[result.params[i].name]) {
            await this.setParamValue(userId, result.params[i].code, response.data[result.params[i].name]);
        }
     }
    }
    if (result.num) {
        await this.setNextAction(userId, actionId, result.num);
    }
  }

  async http(userId, requestId, actionId, type, url, body) {
    if (type == 'POST') {
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

  async httpRequest(): Promise<boolean> {
    try {
      const x = await this.service.query(
        `select a.id as user_id, d.id as request_id, b.id as action_id, d.request_type,
                e.api || d.url as url, x.id as context_id
         from   users a
         inner  join common_context x on (x.id = a.context_id)
         inner  join action b on (b.id = x.action_id)
         inner  join action_type c on (c.id = b.type_id)
         inner  join request d on (d.actiontype_id = c.id)
         inner  join server e on (e.id = d.server_id)
         where  x.scheduled < now()
         order  by x.scheduled
         limit  100`);
      if (!x || x.length == 0) return false;
      for (let k = 0; k < x.length; k++) {
        let body = {};
        const y = await this.service.query(
         `select a.param_name, b.value
          from   request_param a
          left   join user_param b on (b.type_id = a.paramtype_id and b.user_id = $1)
          where  a.request_id = $2`, [x[k].user_id, x[k].request_id]);
        if (y && y.length > 0) {
           for (let i = 0 ; i < y.length; i++) {
             body[y[i].param_name] = y[i].value;
           }
           body['device'] = BOT_DEVICE;
        }
        await this.http(x[k].user_id, x[k].request_id, x[k].action_id, x[k].request_type, x[k].url, body);
       }
       return true;
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
      await this.service.query(`select setParamValue($1, $2, $3)`, [userId, paramCode, paramValue]);
    } catch (error) {
      console.error(error);
    }
  }

  async setNextAction(userId: number, actionId: number, num: number) {
    try {
      await this.service.query(`select setActionByNum($1, $2, $3)`, [userId, actionId, num]);
    } catch (error) {
      console.error(error);
    }
  }

  async dbProc(): Promise<boolean> {
    try {
      const x = await this.service.query(
        `select a.id as user_id, d.id as proc_id, b.id as action_id, 
                d.name as proc_name, a.username as user_name,
                x.id as context_id
         from   users a
         inner  join common_context x on (x.id = a.context_id)
         inner  join action b on (b.id = x.action_id)
         inner  join action_type c on (c.id = b.type_id)
         inner  join dbproc d on (d.actiontype_id = c.id)
         where  x.scheduled < now()
         order  by x.scheduled
         limit  100`);
      if (!x || x.length == 0) return false;
      for (let k = 0; k < x.length; k++) {
        let params = [x[k].user_id];
        let sql = 'select ' + x[k].proc_name + '($1';
        const y = await this.service.query(
           `select a.order_num, coalesce(b.value, a.value) as value
            from  db_param a
            left  join user_param b on (b.type_id = a.paramtype_id and b.user_id = $1)
            where a.proc_id = $2
            order by a.order_num`, [x[k].user_id, x[k].proc_id]);
        if (y && y.length > 0) {
            for (let i = 0; i < y.length; i++) {
                 sql = sql + ',$' + y[i].order_num;
                 params.push(y[i].value);
            }
        }
        sql = sql + ') as value';
        let action = null;
        const z = await this.service.query(sql, params);
        if (z && z.length > 0) {
             const p = await this.service.query(`
              select a.name, a.paramtype_id
              from   db_result a
              where  a.proc_id = $1 and not a.paramtype_id is null`, [x[k].proc_id]);
            if (p && p.length > 0) {
              for (let i = 0; i < p.length; i++) {
                if (z[0].value[p[i].name]) {
                  await this.setParam(x[k].user_name, p[i].paramtype_id, z[0].value[p[i].name]);
                }
              }
            }
            const q = await this.service.query(`
              select a.name, b.result_value, b.action_id
              from   db_result a
              inner  join db_action b on (b.result_id = a.id)
              where  a.proc_id = $1
              order  by b.order_num`, [x[k].proc_id]);
            if (q && q.length > 0) {
               for (let i = 0; i < q.length; i++) {
                  if (z[0].value[q[i].name] == q[i].result_value) {
                    action = q[i].action_id;
                  }
               }
            }
        }
        if (action === null) {
          action = await this.getNextAction(x[k].action_id, true);
        }
        await this.service.createQueryBuilder("common_context")
        .update(common_context)
        .set({ 
            scheduled: action ? new Date() : null,
            action_id: action
        })
        .where("id = :id", {id: x[k].context_id})
        .execute();
      }
      return true;
    } catch (error) {
      console.error(error);
    }
  }

  async setParam(username: string, paramId: number, paramValue: string) {
    try {
      const id = await this.getUserId(username);
      await this.service.query(`select setParamValue($1, $2, $3)`, [id, paramId, paramValue]);
    } catch (error) {
      console.error(error);
    }
  }

  async httpJob(id, type, url, dbproc, server_id) {
    if (type == 'GET') {
      this.httpService.get(url)      
      .subscribe(async response => {
        for (let i = 0; i < response.data.length; i++) {
          await this.service.createQueryBuilder("job_data")
          .insert()
          .into(job_data)
          .values({
            job_id: id,
            result_code: response.status,
            data: response.data[i],
            server_id: server_id
          })
          .execute();
        }
        const sql = 'select ' + dbproc + '($1,$2)';
        await this.service.query(sql, [id, server_id]);
      }, async error => {
        if (!error.response) {
           console.error(error);
           return []; 
        }
      });
    }
  }

  async runJob(): Promise<boolean> {
    try {
      const x = await this.service.query(
        `select a.id, b.request_type, d.api || b.url as url, c.name, d.id as server_id
         from   job a
         inner  join request b on (b.id = a.request_id)
         inner  join dbproc c on (c.id = a.proc_id)
         inner  join server d on (d.id = b.server_id)`);
      if (!x || x.length == 0) return false;
      for (let i = 0; i < x.length; i++) {
         await this.httpJob(x[i].id, x[i].request_type, x[i].url, x[i].name, x[i].server_id);
      }
      return true;
    } catch (error) {
      console.error(error);
    }
  }
}
