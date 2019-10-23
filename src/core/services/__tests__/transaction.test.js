import TransactionController from '../transactions';
import { HttpProvider } from 'ruban-providers';
import Ruban from 'rubanjs';
import { TextDecoder, TextEncoder } from 'util';
import ObservableStore from 'obs-store';

describe('#getUnapprovedTxCount', function() {
  let txController;
  const currentNetworkId = 999;
  const selectedAddress = '0xc684832530fcbddae4b4230a47e991ddcec2831d';
  const chainIdStore = new ObservableStore(currentNetworkId);
  const accountsStore = new ObservableStore({ selectedAddress: selectedAddress });
  let ruban = new Ruban(new HttpProvider('http://127.0.0.1:8545/rpc'), null, {
    defaultGasPrice: 1,
    defaultGas: 9000000000,
    textEncoder: new TextEncoder(),
    textDecoder: new TextDecoder(),
  });

  beforeEach(() => {
    txController = new TransactionController({
      initState: {},
      chainIdStore,
      accountsStore,
      txHistoryLimit: 40,
      ruban: ruban,
      getPrivateKey: undefined,
      addPrivateKeyToWallet: () => {},
    });
  });

  it('should return the number of unapproved txs', function() {
    txController.txStateManager._saveTxList([
      { id: 1, status: 'unapproved', chainId: currentNetworkId, txParams: {}, history: [{}] },
      { id: 2, status: 'unapproved', chainId: currentNetworkId, txParams: {}, history: [{}] },
      { id: 3, status: 'unapproved', chainId: currentNetworkId, txParams: {}, history: [{}] },
    ]);
    const unapprovedTxCount = txController.getUnapprovedTxCount();
    expect(unapprovedTxCount).toEqual(3);
  });

  it('should return the number of pending txs', function() {
    txController.txStateManager._saveTxList([
      { id: 1, status: 'submitted', chainId: currentNetworkId, txParams: {}, history: [{}] },
      { id: 2, status: 'submitted', chainId: currentNetworkId, txParams: {}, history: [{}] },
      { id: 3, status: 'submitted', chainId: currentNetworkId, txParams: {}, history: [{}] },
    ]);
    const pendingTxCount = txController.getPendingTxCount();
    expect(pendingTxCount).toEqual(3);
  });

  it('should add an unapproved transaction and return a valid txMeta', function(done) {
    txController
      .addUnapprovedTransaction({ from: selectedAddress })
      .then(txMeta => {
        expect(txMeta.id).toBeDefined();
        expect(txMeta.chainId).toBeDefined();
        expect(txMeta.txParams).toBeDefined();
        expect(txMeta.history).toBeDefined();

        const memTxMeta = txController.txStateManager.getTx(txMeta.id);
        expect(memTxMeta).toEqual(txMeta);
        done();
      })
      .catch(done);
  });

  it('should emit newUnapprovedTx event and pass txMeta as the first argument', function(done) {
    txController.once('newUnapprovedTx', txMetaFromEmit => {
      expect(txMetaFromEmit).toBeDefined();
      done();
    });
    txController.addUnapprovedTransaction({ from: selectedAddress }).catch(done);
  });

  it('should fail if netId is loading', function(done) {
    txController.chainIdStore = new ObservableStore('loading');
    txController
      .addUnapprovedTransaction({
        from: selectedAddress,
        to: '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
      })
      .catch(err => {
        if (err.message === 'Pihsiu is having trouble connecting to the network') done();
        else done(err);
      });
  });
});

describe('#wipeTransactions', function() {
  const specificAddress = '0xaa';
  const otherAddress = '0xbb';
  const currentNetworkId = 999;
  const otherNetworkId = 666;

  let ruban = new Ruban(new HttpProvider('http://127.0.0.1:8545/rpc'), null, {
    defaultGasPrice: 1,
    defaultGas: 9000000000,
    textEncoder: new TextEncoder(),
    textDecoder: new TextDecoder(),
  });
  const chainIdStore = new ObservableStore(currentNetworkId);
  const accountsStore = new ObservableStore({ selectedAddress: specificAddress });

  let txController, txStateManager;

  beforeEach(() => {
    txController = new TransactionController({
      initState: {},
      chainIdStore,
      accountsStore,
      txHistoryLimit: 40,
      ruban: ruban,
      getPrivateKey: undefined,
      addPrivateKeyToWallet: () => {},
    });
    txStateManager = txController.txStateManager;
  });

  it('should remove only the transactions from a specific address', function() {
    const txMetas = [
      {
        id: 0,
        status: 'submitted',
        txParams: { from: specificAddress, to: otherAddress },
        chainId: currentNetworkId,
      },
      {
        id: 1,
        status: 'timeout',
        txParams: { from: otherAddress, to: specificAddress },
        chainId: currentNetworkId,
      },
      {
        id: 2,
        status: 'confirmed',
        txParams: { from: otherAddress, to: specificAddress },
        chainId: currentNetworkId,
      },
    ];
    txMetas.forEach(txMeta => txStateManager.addTx(txMeta));

    txStateManager.wipeTransactions(specificAddress);

    const transactionsFromCurrentAddress = txStateManager
      .getTxList()
      .filter(txMeta => txMeta.txParams.from === specificAddress);
    const transactionsFromOtherAddresses = txStateManager
      .getTxList()
      .filter(txMeta => txMeta.txParams.from !== specificAddress);

    expect(transactionsFromCurrentAddress.length).toEqual(0);
    expect(transactionsFromOtherAddresses.length).toEqual(2);
  });

  it('should not remove the transactions from other networks', function() {
    const txMetas = [
      {
        id: 0,
        status: 'submitted',
        txParams: { from: specificAddress, to: otherAddress },
        chainId: currentNetworkId,
      },
      {
        id: 1,
        status: 'confirmed',
        txParams: { from: specificAddress, to: otherAddress },
        chainId: otherNetworkId,
      },
      {
        id: 2,
        status: 'confirmed',
        txParams: { from: specificAddress, to: otherAddress },
        chainId: otherNetworkId,
      },
    ];

    txMetas.forEach(txMeta => txStateManager.addTx(txMeta));

    txStateManager.wipeTransactions(specificAddress);

    const txsFromCurrentNetworkAndAddress = txStateManager
      .getTxList()
      .filter(txMeta => txMeta.txParams.from === specificAddress);
    const txFromOtherNetworks = txStateManager
      .getFullTxList()
      .filter(txMeta => txMeta.chainId === otherNetworkId);

    expect(txsFromCurrentNetworkAndAddress.length).toEqual(0);
    expect(txFromOtherNetworks.length).toEqual(2);
  });
});
