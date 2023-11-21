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
  MENU: 3,
  SETV: 4,
  GETV: 5,
  SEND: 6
};

let app = null;
let bot = null;

let commands = [];

let run = async function() {
  if (await app.exec()) {
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

  async exec() {
    if (this.state == STATE.QEUE) {
        this.state = STATE.WAIT;
        await this.appService.getActions(this, this.execCallback, STATE.MENU);
        return true;
    } else if (this.state == STATE.MENU) {
        this.state = STATE.WAIT;
        await this.appService.getMenu(this, this.menuCallback, this.execCallback, STATE.SETV);
        return true;
    } else if (this.state == STATE.GETV) {
        this.state = STATE.WAIT;
        await this.appService.getParams(this, this.sendCallback, this.execCallback, STATE.SETV);
        return true;
    } else if (this.state == STATE.SETV) {
        this.state = STATE.WAIT;
        await this.appService.setParams(this, this.execCallback, STATE.SEND);
        return true;
    } else if (this.state == STATE.SEND) {
      this.state = STATE.WAIT;
      await this.appService.sendMessages(this, this.sendCallback, this.execCallback, STATE.QEUE);
      return true;
    }
    return true;
  }

  async sendCallback(chatId: number, text: string) {
    if (chatId) {
        await bot.sendMessage(chatId, text);
    }
  }

  async menuCallback(chatId: number, text: string, msg) {
    if (chatId) {
        await bot.sendMessage(chatId, text, msg);
    }
  }

  execCallback(self: AppModule, state: number) {
    self.state = state;
  }

  startCallback(self: AppModule, token: string) {
    bot = new TelegramBot(token, {polling: true});
    bot.on('text', async msg => {
      try {
        const chatId = msg.chat.id;
        let cmd = null;
        const r = msg.text.match(/\/(\w+)/);
        if (r) {
            cmd = r[1];
        }
        if (cmd !== null) {
            if (cmd == 'start') {
              commands = await self.appService.getCommands();
              await self.appService.createUser(msg.from.username, chatId, msg.from.first_name, msg.from.last_name, msg.from.language_code);
              return;
            }
            for (let i = 0; i < commands.length; i++) {
              if (commands[i].name == cmd) {
                  await self.appService.setAction(msg.from.username, commands[i].action);
                  return;
              }
            }
        }
        if (await self.appService.saveParam(msg.from.username, msg.text)) return;
        // TODO: Chat


      } catch (error) {
        console.error(error);
      }
//    console.log(msg);
    });
    bot.on('callback_query', async msg => {
      try {
        await self.appService.chooseItem(msg.from.username, msg.data);
      } catch (error) {
        console.error(error);
      }
//    console.log(msg);
    });
  }
}
