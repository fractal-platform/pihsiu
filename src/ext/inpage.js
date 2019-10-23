import { isString } from 'lodash';
import { HttpProvider } from 'ruban-providers';
import Ruban from 'rubanjs';
import BC from '../core/engine/BackgroundConnection';
import { Account, addressToPk, isPihsiuPk, pkToAddress } from './lib/inpageProxy/WalletModule';
import windowConnector from './windowConnector';
import { getTextCodingFunction } from '../core/utils';

const bc = new BC(new windowConnector());
let rpcUrl = 'http://127.0.0.1:8545/rpc';

const makeProxyProvider = provider => {
  return new Proxy(provider, {
    get: (target, key) => {
      if (key === 'send') {
        return (method, parameters) => {
          if (method === 'txpool_sendRawTransaction') {
            return new Promise((resolve, reject) => {
              bc.sendAsync({
                type: 'transaction/sendRawTransaction',
                payload: [parameters[0], window.location.origin],
              })
                .then(msg => resolve(msg.payload))
                .catch(err => reject(err));
            });
          } else {
            return target.send(method, parameters);
          }
        };
      } else {
        return target[key];
      }
    },
  });
};

bc.on('stateChanged', msg => {
  const { selectedAddress, rpcUrl } = msg.payload;
  let provider = new HttpProvider(rpcUrl, {
    headers: [
      {
        name: 'Access-Control-Allow-Origin',
        value: rpcUrl,
      },
    ],
  });
  if (window.ruban) {
    rpcUrl && window.ruban.setProvider(makeProxyProvider(provider));
    if (selectedAddress) {
      window.ruban.wallet.clear();
      window.ruban.wallet.add(addressToPk(selectedAddress));
    }
  }
});

const { TextEncoder, TextDecoder } = getTextCodingFunction();
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const provider = new HttpProvider(rpcUrl, {
  headers: [
    {
      name: 'Access-Control-Allow-Origin',
      value: rpcUrl,
    },
  ],
});

const ruban = new Ruban(makeProxyProvider(provider), null, {
  defaultGasPrice: 1,
  defaultGas: 3000000,
  textEncoder,
  textDecoder,
});

const signer = new Proxy(ruban.fra.transactionSigner, {
  get: (target, key) => {
    if (key === 'sign') {
      return (transaction, privateKey) => {
        return new Promise((resolve, reject) => {
          bc.sendAsync({
            type: 'transaction/addTxFromDapp',
            payload: [transaction],
          })
            .then(msg => resolve({ rawTransaction: msg.payload }))
            .catch(err => reject(err));
        });
      };
    } else if (key === 'type') {
      return 'inpageSigner';
    } else {
      return target[key];
    }
  },
});

ruban.fra.transactionSigner = signer;

const wallet = new Proxy(ruban.fra.wallet, {
  get: (target, key) => {
    if (key === 'generate') {
      return (privateKey, wallet) => {
        if (isPihsiuPk(privateKey)) {
          return new Account(pkToAddress(privateKey), wallet);
        } else {
          return target.generate(privateKey, wallet);
        }
      };
    }
    if (key === 'add') {
      return account => {
        if (isString(account)) {
          account = Account.fromPrivateKey(account, [], target);
        }
        target.add(account);
      };
    }
    return target[key];
  },
});

const fra = new Proxy(ruban.fra, {
  get: (target, key) => {
    if (key === 'wallet') {
      return wallet;
    }
    return target[key];
  },
});

ruban.fra = fra;

window.ruban = ruban;
