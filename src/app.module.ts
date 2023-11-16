import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { appProvider } from './app.provider';

const TelegramBot = require('node-telegram-bot-api');

const TIMEOUT = 1000;

const STATE = {
  WAIT: 1,
  QEUE: 2,
  MENU: 3
};

let app = null;
let bot = null;

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
    await this.appService.getToken(this, this.startCallback);
  }

  exec() {
    if (this.state == STATE.QEUE) {
        this.state = STATE.WAIT;
        this.appService.getActions(this, this.execCallback, STATE.MENU);
        return true;
    } else if (this.state == STATE.MENU) {
        this.state = STATE.WAIT;
        this.appService.getMenu(this, this.menuCallback, STATE.MENU, STATE.QEUE);
        return true;
    }

    return true;
  }

  menuCallback(self: AppModule, state: number, chatId: number, text: string, msg) {
    if (chatId) {
        bot.sendMessage(chatId, text, msg);
    }
    self.state = state;
  }

  execCallback(self: AppModule, state: number) {
    self.state = state;
  }

  startCallback(self: AppModule, token: string) {
    bot = new TelegramBot(token, {polling: true});
    bot.on('text', (msg) => {
      try {
        const chatId = msg.chat.id;
        const s = msg.text + ' ';
        if (s.startsWith('/start ')) {
            self.appService.createUser(msg.from.username, chatId, msg.from.first_name, msg.from.last_name, msg.from.language_code);
        } else {
            bot.sendMessage(chatId, msg.text);
        }
      } catch (error) {
        console.error(error);
      }
      console.log(msg);
    });
  }
}
