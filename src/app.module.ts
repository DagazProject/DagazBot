import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { appProvider } from './app.provider';

const TelegramBot = require('node-telegram-bot-api');

@Module({
  imports: [DatabaseModule],
  controllers: [AppController],
  providers: [...appProvider, AppService],
})
export class AppModule {

  constructor(private readonly appService: AppService) {
    this.start();
  }

  async start() {
    await this.appService.getToken(this.callback);
  }

  callback(token: string) {
    const bot = new TelegramBot(token, {polling: true});
    bot.on('text', (msg) => {
      const chatId = msg.chat.id;
      if (msg.text.startsWith('/start')) {
          bot.sendMessage(chatId, 'STARTED');
      } else {
          bot.sendMessage(chatId, msg.text);
      }
      console.log(msg);
    });
  }
}
