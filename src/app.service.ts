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
}
