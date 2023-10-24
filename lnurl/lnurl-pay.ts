import axios from 'axios';
import { logger } from '../logger';

// {
//	pr: String, // bech32-serialized lightning invoice
//	routes: [], // an empty array
// }
const resolvLightningAddress = async (address: string, amountMsat: number) => {
  const [user, domain] = address.split('@');
  const lnAddressQuery = `https://${domain}/.well-known/lnurlp/${user}`;

  const lnAddressRes = (await axios.get(lnAddressQuery)).data;

  if (lnAddressRes.tag !== 'payRequest') {
    logger.info('lnAddress invalid response');
    return false;
  }

  if (
    lnAddressRes.minSendable > amountMsat ||
    lnAddressRes.maxSendable < amountMsat
  ) {
    logger.info('lnAddress invalid amount');
    return false;
  }

  const res = (
    await axios.get(`${lnAddressRes.callback}${'?'}amount=${amountMsat}`)
  ).data;

  return res;
};

const existLightningAddress = async (address: string) => {
  const [user, domain] = address.split('@');
  const lnAddressQuery = `https://${domain}/.well-known/lnurlp/${user}`;

  try {
    const lnAddressRes = (await axios.get(lnAddressQuery)).data;
    if (lnAddressRes.tag !== 'payRequest') {
      logger.info('Invalid response from LNURL');
      return false;
    }

    return true;
  } catch (error) { debugger
    logger.info(`The ligthning address ${address} does not exist`);
    return false;
  }
};

export { resolvLightningAddress, existLightningAddress };
