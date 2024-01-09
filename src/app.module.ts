import { HttpModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { appProvider } from './app.provider';

const TelegramBot = require('node-telegram-bot-api');

const RUN_TIMEOUT = 500;
const JOB_TIMEOUT = 60000;

let app = null;
let bot = null;

let commands = [];

let isProcessing = false;

let run = async function() {
  if (await app.exec()) {
      setTimeout(run, RUN_TIMEOUT);
  }
}

let job = async function() {
  if (await app.job()) {
      run();
  }
  setTimeout(job, JOB_TIMEOUT);
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
    job();
  }

  async start() {
    await this.appService.getToken(this, this.startCallback);
  }

  async job() {
    let r = false;
    if (isProcessing) return false;
    isProcessing = true;
    r = await this.appService.runJob();
    isProcessing = false;
    return r;
  }

  async exec() {
    if (isProcessing) return false;
    isProcessing = true;
    let r = false;
    if (await this.appService.getActions()) r = true;
    if (await this.appService.getMenu(this.menuCallback)) r = true;
    if (await this.appService.getVirtualMenu(this.menuCallback)) r = true;
    if (await this.appService.getParams(this.sendCallback)) r = true;
    if (await this.appService.setParams()) r = true;
    if (await this.appService.sendInfo(this.sendCallback)) r = true;
    if (await this.appService.sendMessages(this.sendCallback)) r = true;
    if (await this.appService.httpRequest()) r = true;
    if (await this.appService.dbProc()) r = true;
    isProcessing = false;
    return r;
  }

  async sendCallback(chatId: number, text: string, reply: number) {
    let r = null;
    if (chatId) {
        try {
          if (reply) {
            r = await bot.sendMessage(chatId, text, {
              reply_to_message_id: reply
            });
          } else {
            r = await bot.sendMessage(chatId, text);
          }
        } catch (error) {
          console.error(error);
        }
    }
    return r;
  }

  async menuCallback(chatId: number, text: string, msg) {
    let r = null;
    if (chatId) {
      try {
        r = await bot.sendMessage(chatId, text, msg);
      } catch (error) {
        console.error(error);
      }
    }
    return r;
  }

  async deleteMessage(chatId: number, msgId: number) {
    if (chatId && msgId) {
        try {
          await bot.deleteMessage(chatId, msgId);
        } catch (error) {
          console.error(error);
        }
    }
  }

  startCallback(self: AppModule, token: string) {
    bot = new TelegramBot(token, {polling: true});
    bot.on('text', async msg => {
//    console.log(msg);
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
              await self.appService.createUser(msg.from.username ? msg.from.username : msg.from.id, msg.from.id, chatId, msg.from.first_name, msg.from.last_name, msg.from.language_code);
              await run();
              return;
            }
        }
        if (cmd !== null) {
            for (let i = 0; i < commands.length; i++) {
                if (commands[i].name == cmd) {
                    let params = [];
                    for (let j = 0; j < commands[i].params.length; j++) {
                        if (r[j + 2]) {
                            params.push({
                                id: commands[i].params[j],
                                value: r[j + 2]
                            });
                        }
                    }
                    await self.appService.addAction(msg.from.username ? msg.from.username : msg.from.id, commands[i].action, params);
                    await run();
                    return;
                }
            }
        }
        if (await self.appService.saveParam(msg.from.username ? msg.from.username : msg.from.id, msg.text, chatId, msg.message_id, self.deleteMessage)) {
          await run();
          return;
        }
        await self.appService.saveMessage(msg.from.username ? msg.from.username : msg.from.id, msg.message_id, msg.text, msg.reply_to_message);
      } catch (error) {
            console.error(error);
      }
    });
    bot.on('callback_query', async msg => {
//    console.log(msg);
      try {
        const chatId = msg.from.id;
        await self.appService.chooseItem(msg.from.username ? msg.from.username : msg.from.id, msg.data, chatId, self.deleteMessage);
        await run();
      } catch (error) {
        console.error(error);
      }
    });
  }
}
