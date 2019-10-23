import AccountsController from '../accounts';
import EdgeEncryptor from '../../../ext/edge-encryptor';
import Ruban from 'rubanjs';
import { HttpProvider} from 'ruban-providers';
import {TextEncoder, TextDecoder}  from 'util';
const crypto = require('@trust/webcrypto');
global.crypto = crypto;


describe('accounts', () => {
  let c;
  const seedPhraseValid = 'course best loop useful iron sibling survey quit blush garbage health useful';
  const seedPhraseInValid = 'course best loop useful iron sibling survey quit blush garbage health useless';

  const password1 = "12345678";
  const password2 = "12345";

  const privateKey = '0xf0b882b8d549ee19c08ea590a5a78806e457ca71d3d9f44694b2480f25878de0';
  const publicKey = '0x4d2366824c45b2fe103af44f92bd7b5af4d297c9';

  beforeEach(() => {
    c = new AccountsController({
      initState: {},
      encryptor: new EdgeEncryptor()
    });
  });

  it('createNewVaultAndKeychain', async () => {
    const vault = await c.createNewVaultAndKeychain(password1);
    expect(vault.keyrings[0].accounts[0]).toBeDefined();
  });

  it('createNewVaultAndRestore', async () => {
    const vault = await c.createNewVaultAndKeychain(password1);
    await c.addNewAccount();

    const seeds = await c.getAndVerifySeedPhrase();

    const vault1 = await c.createNewVaultAndRestore(password2, seeds);
    expect(vault1).toEqual(vault);

    await expect(c.submitPassword(password1)).rejects.toThrow('Incorrect password');

    const vault2 = await c.submitPassword(password2);
    expect(vault2).toEqual(vault1);
  });

  it('submitPassword', async () => {
    const vault = await c.createNewVaultAndKeychain(password1);
    await expect(c.submitPassword(password2)).rejects.toThrow('Incorrect password');
    const b = await c.submitPassword(password1);
    expect(vault).toEqual(b);
  });

  it('addNewAccount', async () => {
    await c.createNewVaultAndKeychain(password1);
    await c.addNewAccount();
    expect(c.memStore.getState().keyrings[0].accounts).toHaveLength(2);
  });

  it('useCustomSeedToRestoreAccount', async ()=>{
    const vault = await c.createNewVaultAndRestore(password1,seedPhraseValid);
    expect(vault.keyrings[0].accounts[0].toLowerCase()).toEqual(publicKey);
  });

  it('useCustomSeedToRestoreAccount_withinit', async ()=>{
    await c.createNewVaultAndKeychain(password1);
    const vault = await c.createNewVaultAndRestore(password1,seedPhraseValid);
    expect(vault.keyrings[0].accounts[0].toLowerCase()).toEqual(publicKey);
  });

  it('invalidSeedPhrase', async ()=>{
    await expect(c.createNewVaultAndRestore(password1,seedPhraseInValid)).rejects.toThrow('Seed phrase is invalid.')
  });

  it('getAndVerifySeedPhrase', async ()=>{
    await c.createNewVaultAndRestore(password1,seedPhraseValid);
    expect(await c.getAndVerifySeedPhrase()).toEqual(seedPhraseValid);
  });

  it('exportAccount',async ()=>{
    await c.createNewVaultAndRestore(password1,seedPhraseValid);
    expect(await c.exportAccount(publicKey)).toEqual(privateKey.substr(2))
  });

  it('setLocked', async () => {
    const vault1 = await c.createNewVaultAndKeychain(password1);

    await c.setLocked();
    expect(c.memStore.getState().keyrings).toHaveLength(0);

    const vault2= await c.submitPassword(password1);
    expect(vault1).toEqual(vault2);
  });

  it('importAccountWithStrategy',async ()=>{
    await c.createNewVaultAndKeychain(password1);
    await c.importAccountWithStrategy('Private Key',[privateKey]);
    expect(c.memStore.getState().keyrings).toHaveLength(2);
    expect(c.memStore.getState().keyrings[1].accounts[0].toLowerCase()).toEqual(publicKey);
  });

  it('export imported privateKey ', async () => {
    await c.createNewVaultAndKeychain(password1);
    await c.importAccountWithStrategy('Private Key', [privateKey]);

    const exportAccount = await c.exportAccount(publicKey);
    expect(exportAccount).toEqual(privateKey.substr(2));
  });

  it('addPrivateKeyToWallet', async () =>{
    let ruban = new Ruban( new HttpProvider('http://127.0.0.1:8545/rpc') , null, {
      defaultGasPrice: 1,
      defaultGas: 9000000000,
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    });

    c.ruban=ruban;
    await c.createNewVaultAndKeychain(password1);
    await c.importAccountWithStrategy('Private Key', [privateKey]);
    expect(c.ruban.fra.wallet.remove(publicKey)).toEqual(false);  //privateKey not exist in wallet

    await c.addPrivateKeyToWallet(publicKey);
    expect(c.ruban.fra.wallet.remove(publicKey)).toEqual(true);   //privateKey already exist in wallet
  })

});
