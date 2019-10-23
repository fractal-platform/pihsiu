import { HttpProvider } from 'ruban-providers';
import Ruban from 'rubanjs';
import { TextDecoder, TextEncoder } from 'util';
import NetworkController from '../network';
import { LOCALHOST, LOCALHOST_DISPLAY_NAME, LOCAL_URL, TESTNET_CODE } from '../network/enums';

describe('#NetworkController', function() {
  let networkController;

  beforeEach(() => {
    let ruban = new Ruban(new HttpProvider('http://127.0.0.1:8545/rpc'), null, {
      defaultGasPrice: 1,
      defaultGas: 9000000000,
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder(),
    });
    networkController = new NetworkController(ruban);
  });

  it('default action', () => {
    expect(networkController.currentProviderStore.getState()).toEqual({
      type: LOCALHOST,
      displayname: LOCALHOST_DISPLAY_NAME,
      rpcUrl: LOCAL_URL,
      chainId: TESTNET_CODE,
    });
    expect(networkController.providerListStore.getState().length).toEqual(2);
  });

  it('switchNetwork', () => {
    const provider = {
      type: 'mycustomRpc',
      displayname: 'My Custorm Display Name',
      rpcUrl: 'http://10.1.1.55:8545/rpc',
      chainId: 996,
    };
    networkController.switchNetwork(provider);
    expect(networkController.ruban.currentProvider).toBeDefined();
    expect(networkController.ruban.currentProvider.host).toEqual(provider.rpcUrl);
    expect(networkController.currentProviderStore.getState()).toEqual(provider);
    expect(networkController.providerListStore.getState().length).toEqual(3);
  });
});
