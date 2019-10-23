/**
 * Action is sent from UI to background, trigger a bundle of effects.
 *
 * @property type format like 'controller/method', used for route action to specific method.
 * @property payload the data of action.
 * @property nonce means this action need a response right now or not.
 */
interface Action {
  type: string;
  payload: Array<any>;
  nonce?: string;
}

/**
 * Answer is the response of background for an action.
 *
 * @property Type indecates which type action is responsed.
 * @property Payload is the return data.
 * @property Nonce indecates action's nonce.
 * @property Error if happens.
 */
interface Answer {
  type: string;
  payload: any;
  nonce?: string;
  error?: Error;
}

interface txParams {
  from: string;
  gas: number;
  gasPrice: string;
  to: string;
  value: number;
}

interface PihsiuState {
  // pihsiuController state:
  isInitialized: boolean;
  isUnlocked: boolean;

  // accountsController state:
  identities: {
    [address: string]: {
      address: string;
      name: string;
    };
  };
  selectedAddress: string;
  keyringTypes: Array<string>;
  keyrings: [
    {
      accounts: Array<string>;
      type: string;
    }
  ];
  vault: string;

  //transactionController state:
  transactions: Array<transaction>;

  //networkController state:
  chainId: number | string;
  currentProvider: provider;
  providerList: Array<provider>;
}

interface transaction {
  id: number;
  hash: string;
  history: Array<history>;
  chainId: number;
  status: txStatus;
  submittedTime: number; //todo does it needed?
  txParams: txParams;
  txReceipt: {
    contractAddress: string;
    cumulativeGasUsed: number;
    gasUsed: number;
    logs: Array<any>;
    logsBloom: number;
    root: number;
    status: boolean;
    transactionHash: string;
  };
  err: object;
  type: string;
  provider: provider;
}

interface history {
  op: txStatus;
  timestamp: number;
}

//todo what happen here
enum txStatus {
  'created',
  'submitted',
  'confirmed',
  'receipt',
  'timeout',
  'failed',
}

interface provider {
  chainId: number;
  displayname: string;
  rpcUrl: string;
  type: string;
}
