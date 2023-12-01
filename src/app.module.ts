import { HttpModule, Module } from '@nestjs/common';
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
  INFO: 6,
  SEND: 7,
  HTTP: 8,
  DBPR: 9
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
  imports: [HttpModule, DatabaseModule],
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
        await this.appService.getMenu(this, this.menuCallback, this.execCallback, STATE.GETV);
        return true;
    } else if (this.state == STATE.GETV) {
        this.state = STATE.WAIT;
        await this.appService.getParams(this, this.sendCallback, this.execCallback, STATE.SETV);
        return true;
    } else if (this.state == STATE.SETV) {
        this.state = STATE.WAIT;
        await this.appService.setParams(this, this.execCallback, STATE.INFO);
        return true;
    } else if (this.state == STATE.INFO) {
        this.state = STATE.WAIT;
        await this.appService.sendInfo(this, this.sendCallback, this.execCallback, STATE.SEND);
        return true;
    } else if (this.state == STATE.SEND) {
        this.state = STATE.WAIT;
        await this.appService.sendMessages(this, this.sendCallback, this.execCallback, STATE.HTTP);
        return true;
    } else if (this.state == STATE.HTTP) {
      this.state = STATE.WAIT;
      await this.appService.httpRequest(this, this.execCallback, STATE.DBPR);
      return true;
    } else if (this.state == STATE.DBPR) {
      this.state = STATE.WAIT;
      await this.appService.dbProc(this, this.execCallback, STATE.QEUE);
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
        commands = await self.appService.getCommands();
        let menu = [];
        for (let i = 0; i < commands.length; i++) {
            menu.push({
              command: commands[i].name,
              description: commands[i].descr
            });
        }
        if (menu.length > 0) {
            bot.setMyCommands(menu);
        }
        let cmd = null;
        const r = msg.text.match(/\/(\w+)\s+(\S+)*/);
        if (r) {
            cmd = r[1];
        }
        if (cmd !== null) {
            if (cmd == 'start') {
              await self.appService.createUser(msg.from.username, chatId, msg.from.first_name, msg.from.last_name, msg.from.language_code);
              return;
            }
        }
        if (await self.appService.saveParam(msg.from.username, msg.text)) return;
        if (cmd !== null) {
            for (let i = 0; i < commands.length; i++) {
            if (commands[i].name == cmd) {
                for (let j = 0; j < commands[i].params.length; j++) {
                    if (r[j + 1]) {
                        await self.appService.setParam(msg.from.username, commands[i].params[j], r[j + 1]);
                    }
                }
                await self.appService.addAction(msg.from.username, commands[i].action);
                return;
            }
          }
        }
        await self.appService.saveMessage(msg.from.username, msg.message_id, msg.text);
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
