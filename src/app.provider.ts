import { Connection } from 'typeorm';
import { users } from './entity/users';

export const appProvider = [
    {
      provide: 'USERS_REPOSITORY',
      useFactory: (connection: Connection) => connection.getRepository(users),
      inject: ['DATABASE_CONNECTION'],
    },
 ];