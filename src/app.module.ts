import { HttpModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { appProvider } from './app.provider';

const TelegramBot = require('node-telegram-bot-api');

const TIMEOUT = 500;

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

  constructor(private readonly appService: AppService) {
    this.start();
    app = this;
    run();
  }

  async start() {
    await this.appService.getToken(this, this.startCallback);
  }

  async exec() {
    await this.appService.getActions();
    await this.appService.getMenu(this.menuCallback);
    await this.appService.getVirtualMenu(this.menuCallback);
    await this.appService.getParams(this.sendCallback);
    await this.appService.setParams();
    await this.appService.sendInfo(this.sendCallback);
    await this.appService.sendMessages(this.sendCallback);
    await this.appService.httpRequest();
    await this.appService.dbProc();
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
        const r = msg.text.match(/\/(\w+)\s*(\S+)*/);
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
                        if (r[j + 2]) {
                            await self.appService.setParam(msg.from.username, commands[i].params[j], r[j + 2]);
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
        await self.exec();
      } catch (error) {
        console.error(error);
      }
//    console.log(msg);
    });
  }
}
