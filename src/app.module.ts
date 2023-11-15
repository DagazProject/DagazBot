import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { appProvider } from './app.provider';

const TelegramBot = require('node-telegram-bot-api');

const TIMEOUT = 1000;

const STATE = {
  WAIT: 1,
  QEUE: 2
};

let app = null;

let run = function() {
  if (app.exec()) {
      setTimeout(run, TIMEOUT);
  }
}

@Module({
  imports: [DatabaseModule],
  controllers: [AppController],
  providers: [...appProvider, AppService],
})
export class AppModule {

  state  = STATE.QEUE;

  constructor(private readonly appService: AppService) {
    this.start();
    app = this;
    run();
  }

  async start() {
    await this.appService.getToken(this, this.callback);
  }

  exec() {
    // TODO:

    return false;
  }

  callback(self: AppModule, token: string) {
    const bot = new TelegramBot(token, {polling: true});
    bot.on('text', (msg) => {
      const chatId = msg.chat.id;
      const s = msg.text + ' ';
      if (s.startsWith('/start ')) {
          self.appService.createUser(msg.from.username, chatId, msg.from.first_name, msg.from.last_name, msg.from.language_code);
      } else {
          bot.sendMessage(chatId, msg.text);
      }
      console.log(msg);
    });
  }
}
