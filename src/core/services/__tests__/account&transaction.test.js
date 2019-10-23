import AccountsController from '../accounts';
import EdgeEncryptor from '../../../ext/edge-encryptor';
import TransactionController from '../transactions';
import { HttpProvider } from 'ruban-providers';
import Ruban from 'rubanjs';
import { TextDecoder, TextEncoder } from 'util';
import ObservableStore from 'obs-store';

const crypto = require('@trust/webcrypto');
global.crypto = crypto;

describe('#getUnapprovedTxCount', function() {

  let txController, accountsController;
  const currentNetworkId = 999;

  const password = '12345678';

  const privateKey = '0xf0b882b8d549ee19c08ea590a5a78806e457ca71d3d9f44694b2480f25878de0';
  const publicKey = '0x4d2366824c45b2fe103af44f92bd7b5af4d297c9';

  const chainIdStore = new ObservableStore(currentNetworkId);
  const accountsStore = new ObservableStore({ selectedAddress: publicKey });
  let ruban = new Ruban(new HttpProvider('http://127.0.0.1:8545/rpc'), null, {
    defaultGasPrice: 1,
    defaultGas: 9000000000,
    textEncoder: new TextEncoder(),
    textDecoder: new TextDecoder(),
  });
  const txParams = {
    'from': publicKey,
    'to': publicKey,
    'value': 1,
  };

  beforeEach(() => {
    accountsController = new AccountsController({
      initState: {},
      encryptor: new EdgeEncryptor(),
      ruban: ruban,
    });
    txController = new TransactionController({
      initState: {},
      chainIdStore,
      accountsStore,
      txHistoryLimit: 40,
      ruban: ruban,
      addPrivateKeyToWallet: accountsController.addPrivateKeyToWallet.bind(accountsController),
    });
  });

  //this test need local blockchain
  //and transfer money to `publicKey`
  it('send transaction with addAndSendTransaction', async (done) => {
    jest.setTimeout(61000);
    await accountsController.createNewVaultAndKeychain(password);
    await accountsController.importAccountWithStrategy('Private Key', [privateKey]);

    txController.addAndSendTransaction(txParams)
      .then((txHash) => {
        console.log(txHash);
        done();
      })
      .catch(err=>done(err));
  });

});
