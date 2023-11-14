import { Inject, Injectable } from '@nestjs/common';
import { users } from './entity/users';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {

  constructor(
    @Inject('USERS_REPOSITORY')
    private readonly service: Repository<users>
  ) {}  

  async getToken(callback) {
    const x = await this.service.query(
      `select b.value as token
       from   server a
       inner  join server_option b on (b.server_id = a.id)
       where  a.type_id = 1`);
    if (x && x.length > 0) {
       callback(x[0].token);
    }
  }
}
