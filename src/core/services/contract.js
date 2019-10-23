import log from 'loglevel';
import { AbiMapper, Serializer } from 'ruban-contract';
import { UPLOADAPI_URL } from '../../ext/URL_ENUM';
import StatableEmitter from './base/StatableEmitter';

export default class ContractService extends StatableEmitter {
  constructor({ models, addAndSendTransaction, tx, platform, textEncoder, textDecoder, ruban }) {
    super();
    this._initModels(models);
    this.addAndSendTransaction = addAndSendTransaction;
    this.tx = tx;
    this.platform = platform;
    this.textEncoder = textEncoder;
    this.textDecoder = textDecoder;
    this.ruban = ruban;
  }

  addOrUpdateFavourite({ contractAddress, name, abi }) {
    const { favourite } = this.models.state.contract;
    if (!favourite[contractAddress]) {
      this.platform.saveAbi(contractAddress, abi);
    }
    this.models.setState('contract/addOrUpdateFavourite', {
      contractAddress,
      name,
    });
  }

  deleteFromFavourite({ contractAddress }) {
    this.models.setState('contract/deleteFromFavourite', {
      contractAddress,
    });
    this.platform.removeAbi(contractAddress);
  }

  async deploy(payload) {
    log.debug('deploy', payload);
    const { txParams, name, abi, isUpload2Browser } = payload;
    delete txParams.to;

    const txId = await this.addAndSendTransaction(txParams, {
      origin: 'Pihsiu',
      type: 'deploy',
    });
    const {
      accounts: { selectedAddress: address },
      network: {
        current: { scanUrl },
      },
    } = this.models.state;
    this.tx.once(`${txId}:confirmed`, finishedTxMeta => {
      log.debug('Deploy finishedTxMeta', finishedTxMeta);

      const contractAddress = finishedTxMeta.txReceipt.contractAddress;
      this.models.setState('contract/add2MyContract', {
        contractAddress,
        info: {
          name,
          owner: address,
        },
      });
      this.platform.saveAbi(contractAddress, abi);

      if (isUpload2Browser) {
        const sourceCode = '';
        const account = this.ruban.wallet.get(finishedTxMeta.txParams.from);
        const signature = account.sign(abi + sourceCode);
        let apiURL;
        try {
          apiURL = new URL(UPLOADAPI_URL, scanUrl);
        } catch (e) {
          log.error(e);
          return txId;
        }
        fetch(apiURL.href, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'cache-control': 'no-cache',
          },
          body: JSON.stringify({
            signature: signature.signature,
            abi,
            sourceCode,
            address: contractAddress,
          }),
        })
          .then(log.debug)
          .catch(log.debug);
      }
    });
    return txId;
  }

  //key is a object || string
  async query({ abi, contractAddress, tableName, key }) {
    const contract = new this.ruban.fra.Contract(abi, contractAddress);
    const resp = await contract.tables[tableName]().query(key);
    return resp;
  }

  async call({ abi, callParams, txParams }) {
    // const contract = new this.ruban.fra.Contract(abi);
    // const ttt = contract.actions[callParams.actionName].encodeABI();
    // log.debug(txParams.data, ttt);
    txParams.data = this._serializeData(abi, callParams.actionName, callParams.actionData);
    const txId = await this.addAndSendTransaction(txParams, {
      origin: 'Pihsiu',
      type: 'call',
    });
    return txId;
  }

  _serializeData(abi, actionName, actionData) {
    const serializer = new Serializer(this.textEncoder, this.textDecoder, abi);
    const abiModel = new AbiMapper(serializer).map(abi);
    return abiModel.getAction(actionName).serialize(actionData);
  }
}
