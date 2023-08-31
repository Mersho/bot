import * as dotenv from "dotenv";
dotenv.config()
const SocksProxyAgent = require('socks-proxy-agent') 
import { start } from "./bot/start";
import mongoConnect from './db_connect'
const { resubscribeInvoices } = require('./ln');
const logger = require('./logger');
const { delay } = require('./util');

(async () => {
  process.on('unhandledRejection', e => {
    if (e) {
      logger.error(`Unhandled Rejection: ${e}`);
    }
  });

  process.on('uncaughtException', e => {
    if (e) {
      logger.error(`Uncaught Exception: ${e}`);
    }
  });

  const mongoose = mongoConnect();
  mongoose.connection
    .once('open', async () => {
      logger.info('Connected to Mongo instance.');
      let options = { handlerTimeout: 60000 };
      if (process.env.SOCKS_PROXY_HOST) {
        const agent = new SocksProxyAgent(process.env.SOCKS_PROXY_HOST);
        options = {
          telegram: {
            agent,
          },
        } as any;
      }
      const bot = start(String(process.env.BOT_TOKEN), options);
      // Wait 1 seconds before try to resubscribe hold invoices
      await delay(1000);
      await resubscribeInvoices(bot);
    })
    .on('error', (error: Error) => logger.error(`Error connecting to Mongo: ${error}`));
})();

