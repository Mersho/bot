import { Telegraf } from "telegraf";
import { MainContext } from "../bot/start";
import {subscribeToInvoice} from 'lightning'
import { Order, User } from '../models';
const { payToBuyer } = require('./pay_request');
import { lnd } from "./connect";
import * as messages from '../bot/messages';
const ordersActions = require('../bot/ordersActions');
const { getUserI18nContext, getEmojiRate, decimalRound } = require('../util');
import logger from "../logger";

const subscribeInvoice = async (bot: Telegraf<MainContext>, id: string, resub: boolean) => {
  try {
    const sub = subscribeToInvoice({ id, lnd });
    sub.on('invoice_updated', async invoice => {
      if (invoice.is_held && !resub) {
        const order = await Order.findOne({ hash: invoice.id });
        if (order === null) throw Error("Order was not found in DB");
        logger.info(
          `Order ${order._id} Invoice with hash: ${id} is being held!`
        );
        const buyerUser = await User.findOne({ _id: order.buyer_id });
        const sellerUser = await User.findOne({ _id: order.seller_id });
        if (buyerUser === null || sellerUser === null) throw Error("buyer or seller was not found in DB");
        order.status = 'ACTIVE';
        // This is the i18n context we need to pass to the message
        const i18nCtxBuyer = await getUserI18nContext(buyerUser);
        const i18nCtxSeller = await getUserI18nContext(sellerUser);
        if (order.type === 'sell') {
          await messages.onGoingTakeSellMessage(
            bot,
            sellerUser,
            buyerUser,
            order,
            i18nCtxBuyer,
            i18nCtxSeller
          );
        } else if (order.type === 'buy') {
          order.status = 'WAITING_BUYER_INVOICE';
          // We need the seller rating
          const stars = getEmojiRate(sellerUser.total_rating);
          const roundedRating = decimalRound(sellerUser.total_rating, -1);
          const rate = `${roundedRating} ${stars} (${sellerUser.total_reviews})`;
          await messages.onGoingTakeBuyMessage(
            bot,
            sellerUser,
            buyerUser,
            order,
            i18nCtxBuyer,
            i18nCtxSeller,
            rate
          );
        }
        order.invoice_held_at = new Date();
        order.save();
      }
      if (invoice.is_confirmed) {
        const order = await Order.findOne({ hash: id });
        if (order === null) throw Error("Order was not found in DB");
        logger.info(
          `Order ${order._id} - Invoice with hash: ${id} was settled!`
        );
        order.status = 'PAID_HOLD_INVOICE';
        await order.save();
        const buyerUser = await User.findOne({ _id: order.buyer_id });
        const sellerUser = await User.findOne({ _id: order.seller_id });
        if (buyerUser === null || sellerUser === null) throw Error("buyer and/or seller was not found in DB");
        // We need two i18n contexts to send messages to each user
        const i18nCtxBuyer = await getUserI18nContext(buyerUser);
        const i18nCtxSeller = await getUserI18nContext(sellerUser);
        await messages.releasedSatsMessage(
          bot,
          sellerUser,
          buyerUser,
          i18nCtxBuyer,
          i18nCtxSeller
        );
        // If this is a range order, probably we need to created a new child range order
        const orderData = await ordersActions.getNewRangeOrderPayload(order);
        let i18nCtx;
        if (orderData) {
          let user;
          if (order.type === 'sell') {
            user = sellerUser;
            i18nCtx = i18nCtxSeller;
          } else {
            user = buyerUser;
            i18nCtx = i18nCtxBuyer;
          }

          const newOrder = await ordersActions.createOrder(
            i18nCtx,
            bot,
            user,
            orderData
          );

          if (newOrder) {
            if (order.type === 'sell') {
              await messages.publishSellOrderMessage(
                bot,
                user,
                newOrder,
                i18nCtx,
                true
              );
            } else {
              await messages.publishBuyOrderMessage(
                bot,
                user,
                newOrder,
                i18nCtx,
                true
              );
            }
          }
        }
        // The seller get reputation after release
        await messages.rateUserMessage(bot, sellerUser, order, i18nCtxSeller);
        // We proceed to pay to buyer
        await payToBuyer(bot, order);
      }
    });
  } catch (error) {
    logger.error('subscribeInvoice catch: ', error);
    return false;
  }
};

export default subscribeInvoice;
