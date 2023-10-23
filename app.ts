import * as dotenv from "dotenv";
dotenv.config()
import { SocksProxyAgent } from "socks-proxy-agent";
import { MainContext, start } from "./bot/start";
import { connect as mongoConnect} from './db_connect'
const { resubscribeInvoices } = require('./ln');
import { logger } from "./logger";
import { Telegraf } from "telegraf";
const { delay } = require('./util');

(async () => {
  process.on('unhandledRejection', e => {
    if (e) {
      if (e instanceof Error){
        logger.error(`Unhandled Rejection: ${e.message}`, e);
      }
      // logger.error(`Unhandled Rejection: ${e}`);
    }
  });

  process.on('uncaughtException', e => {
    if (e) {
      if (e instanceof Error){
        logger.error(`uncaughtException: ${e.message}`, e);
      }
    }
  });

  const mongoose = mongoConnect();
  mongoose.connection
    .once('open', async () => {
      logger.info('Connected to Mongo instance.');
      let options: Partial<Telegraf.Options<MainContext>> = { handlerTimeout: 60000 };
      if (process.env.SOCKS_PROXY_HOST) {
        const agent = new SocksProxyAgent(process.env.SOCKS_PROXY_HOST);
        options = {
          telegram: {
            agent,
          },
        };
      }
      const bot = start(String(process.env.BOT_TOKEN), options);
      // Wait 1 seconds before try to resubscribe hold invoices
      await delay(1000);
      await resubscribeInvoices(bot);
    })
    .on('error', (error: Error) => logger.error(`Error connecting to Mongo: ${error}`));
})();

