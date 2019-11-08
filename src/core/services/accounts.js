import KeyringController from 'eth-keyring-controller';
import log from 'loglevel';
// fixme: platform sepecific feature, should remove later
import seedPhraseVerifier from '../../ext/lib/seed-phrase-verifier';
import accountImporter from '../helpers/AccountImporter';
import StatableEmitter from './base/StatableEmitter';

const { Mutex } = require('await-semaphore');

/**
 * Manage the state for account aspects,
 * such as crud accounts and set selected account and so on.
 */
export default class AccountService extends StatableEmitter {
  constructor(props = {}) {
    super(props.models);
    const { encryptor, ruban } = props;

    this.keyringController = new KeyringController({
      keyringTypes: [],
      initState: this.models.state.accounts,
      getNetwork: () => {
        return props.models.state.network.chainId;
      },
      encryptor: encryptor || undefined,
    });

    // initialize keyrings memstore into accounts
    this.models.setState('accounts/update', { ...this.keyringController.memStore.getState() });

    this.keyringController.store.subscribe(state => {
      this.models.setState('accounts/update', { ...state });
    });

    this.keyringController.memStore.subscribe(memState => {
      this.models.setState('accounts/update', { ...memState });
    });

    // lock to ensure only one vault created at once
    this.createVaultMutex = new Mutex();

    this.ruban = ruban;
  }

  getStatus() {
    const { vault, isUnlocked, isSeedWordsSaved = false } = this.models.state.accounts;
    return { isInitialized: !!vault, isUnlocked, isSeedWordsSaved };
  }

  saveSeedWords() {
    this.models.setState('accounts/saveSeedWords');
  }

  /**
   * Creates a new Vault and create a new keychain.
   *
   * A vault, or KeyringController, is a controller that contains
   * many different account strategies, currently called Keyrings.
   * Creating it new means wiping all previous keyrings.
   *
   * A keychain, or keyring, controls many accounts with a single backup and signing strategy.
   * For example, a mnemonic phrase can generate many accounts, and is a keyring.
   *
   * @param  {string} password
   *
   * @returns {Object} vault
   */
  async createNewVaultAndKeychain(password) {
    const releaseLock = await this.createVaultMutex.acquire();
    try {
      let vault;
      const accounts = await this.keyringController.getAccounts();
      if (accounts.length > 0) {
        vault = await this.keyringController.fullUpdate();
      } else {
        vault = await this.keyringController.createNewVaultAndKeychain(password);
        const accounts = await this.keyringController.getAccounts();

        this.models.setState('accounts/setAddresses', accounts);
        this.models.setState('accounts/selectFirstIdentity');
      }
      releaseLock();
      return vault;
    } catch (err) {
      releaseLock();
      throw err;
    }
  }

  /**
   * Create a new Vault and restore an existent keyring.
   * @param  {} password
   * @param  {} seed
   */
  async createNewVaultAndRestore(password, seed) {
    const releaseLock = await this.createVaultMutex.acquire();
    try {
      const keyringController = this.keyringController;

      // clear known identities
      this.models.setState('accounts/setAddresses', []);
      // create new vault
      const vault = await keyringController.createNewVaultAndRestore(password, seed);

      const primaryKeyring = keyringController.getKeyringsByType('HD Key Tree')[0];
      if (!primaryKeyring) {
        throw new Error('keyrings - No HD Key Tree found');
      }

      let accounts = await this.keyringController.getAccounts();
      let lastBalance;
      try {
        lastBalance = await this.ruban.fra.getBalance(accounts[accounts.length - 1]);
        lastBalance = parseInt(lastBalance);
      } catch (e) {
        lastBalance = 0;
      }

      let accountCount = 0;
      while (lastBalance && lastBalance !== 0 && accountCount < 10) {
        try {
          await this.addNewAccount();
          accounts = await this.keyringController.getAccounts();
          lastBalance = await this.ruban.fra.getBalance(accounts[accounts.length - 1]);
          lastBalance = parseInt(lastBalance);
          accountCount++;
        } catch (e) {
          lastBalance = 0;
        }
      }

      // set new identities
      this.models.setState('accounts/setAddresses', accounts);
      this.models.setState('accounts/selectFirstIdentity');

      releaseLock();
      return vault;
    } catch (err) {
      releaseLock();
      throw err;
    }
  }

  /**
   * Use the given password to login.
   *
   * @param {string} password login password
   * @emits didLogin payload is accounts
   */
  async submitPassword(password) {
    await this.keyringController.submitPassword(password);
    const accounts = await this.keyringController.getAccounts();

    await this.syncAddresses(accounts);
    this.emit('didLogin', accounts);

    return this.keyringController.fullUpdate();
  }

  /**
   * Adds a new account to the default (first) HD seed phrase Keyring.
   *
   * @returns {} keyState
   */
  async addNewAccount(name) {
    const primaryKeyring = this.keyringController.getKeyringsByType('HD Key Tree')[0];
    if (!primaryKeyring) {
      throw new Error('AccountsController - No HD Key Tree found');
    }
    const keyringController = this.keyringController;
    const oldAccounts = await keyringController.getAccounts();
    const keyState = await keyringController.addNewAccount(primaryKeyring);
    const newAccounts = await keyringController.getAccounts();

    await this.getAndVerifySeedPhrase();

    this.models.setState('accounts/setAddresses', newAccounts);

    newAccounts.forEach(address => {
      if (!oldAccounts.includes(address)) {
        this.models.setState('accounts/updateNickName', { address, name });
        this.models.setState('accounts/setSelectedAddress', address);
      }
    });
    const { identities } = this.models.state.accounts;
    return { ...keyState, identities };
  }

  /**
   * Verifies the validity of the current vault's seed phrase.
   *
   * Validity: seed phrase restores the accounts belonging to the current vault.
   *
   * Called when the first account is created and on unlocking the vault.
   *
   * @returns {Promise<string>} Seed phrase to be confirmed by the user.
   */
  async getAndVerifySeedPhrase() {
    const primaryKeyring = this.keyringController.getKeyringsByType('HD Key Tree')[0];
    if (!primaryKeyring) {
      throw new Error('keyrings - No HD Key Tree found');
    }

    const serialized = await primaryKeyring.serialize();
    const seedWords = serialized.mnemonic;

    const accounts = await primaryKeyring.getAccounts();
    if (accounts.length < 1) {
      throw new Error('keyrings - No accounts found');
    }

    try {
      await seedPhraseVerifier.verifyAccounts(accounts, seedWords);
      return seedWords;
    } catch (err) {
      log.error(err.message);
      throw err;
    }
  }

  /**
   * set the address as selected and/or update the name if given.
   *
   * @param {string} address
   * @param {string} name
   */
  setAccount(address, name) {
    const { identities } = this.models.state.accounts;
    if (identities[address]) {
      if (name) {
        this.models.setState('accounts/updateNickName', { address, name });
      }
      this.models.setState('accounts/setSelectedAddress', address);
    }
  }

  /*
   * Synchronizes identity entries with known accounts.
   * Removes any unknown identities, and returns the resulting selected address.
   *
   * @param {Array<string>} addresses known to the vault.
   * @returns {Promise<string>} selectedAddress the selected address.
   */
  syncAddresses(addresses) {
    const { identities } = this.models.state.accounts;

    Object.keys(identities).forEach(identity => {
      if (!addresses.includes(identity)) {
        delete identities[identity];
      }
    });

    this.models.setState('accounts/update', { identities });
    this.models.setState('accounts/addAddresses', addresses);

    // If the selected account is no longer valid,
    // select an arbitrary other account:
    let selected = this.models.state.accounts.selectedAddress;
    if (!addresses.includes(selected)) {
      selected = addresses[0];
      this.models.setState('accounts/setSelectedAddress', selected);
    }

    return selected;
  }

  exportAccount(address) {
    return this.keyringController.exportAccount(address).then(privateKey => {
      if (privateKey.substr(0, 2) !== '0x') {
        privateKey = '0x' + privateKey;
      }
      return privateKey;
    });
  }

  //get privateKey from keyringController
  //import privateKey to ruban
  async addPrivateKeyToWallet(fromAddress) {
    let privateKey = await this.exportAccount(fromAddress);
    this.ruban.fra.wallet.add(privateKey);
  }

  setLocked() {
    return this.keyringController.setLocked();
  }

  /**
   * Imports an account with the specified import strategy.
   * These are defined in app/scripts/account-import-strategies
   * Each strategy represents a different way of serializing an Fractal key pair.
   *
   * @param  {string} strategy - A unique identifier for an account import strategy. 'Private Key' or 'JSON File'
   * @param  {any} args - The data required by that strategy to import an account.
   * @param  {Function} cb - A callback function called with a state update on success.
   */
  async importAccountWithStrategy(strategy, args, name) {
    const privateKey = await accountImporter.importAccount(strategy, args);
    const keyring = await this.keyringController.addNewKeyring('Simple Key Pair', [privateKey]);

    // uncomment
    const accounts = await keyring.getAccounts();
    // update accounts in preferences controller
    const allAccounts = await this.keyringController.getAccounts();
    this.models.setState('accounts/setAddresses', allAccounts);
    // set new account as selected
    this.models.setState('accounts/setSelectedAddress', accounts[0]);
    this.models.setState('accounts/updateNickName', { address: accounts[0], name });
  }

  async sign(data) {
    const { selectedAddress } = this.models.state.accounts;

    await this.addPrivateKeyToWallet(selectedAddress);
    const account = this.ruban.wallet.get(selectedAddress);
    if (!account) {
      console.error('ruban cannot find selectedAddress');
    }
    return account.sign(data);
  }
}
