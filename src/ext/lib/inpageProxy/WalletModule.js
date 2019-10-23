const PK_SUFFIX = '00000000';

function isPihsiuPk(pk) {
  return pk ? pk.endsWith(PK_SUFFIX) : false;
}

function pkToAddress(pk) {
  if (!pk || pk.length < PK_SUFFIX.length) return '';
  return pk.slice(0, pk.length - PK_SUFFIX.length);
}

function addressToPk(address) {
  return `${address}${PK_SUFFIX}`;
}

class Account {
  constructor(address, wallet) {
    this.address = address;
    this.privateKey = addressToPk(address);
    this.minerKeys = [];
    this.wallet = wallet;
  }

  sign(data) {
    throw new Error('Pihsiu not support account.sign method yet');
  }

  toKeystore(password, options = {}) {
    throw new Error('Pihsiu not support account.toKeystore method');
  }

  static from(entropy, wallet) {
    throw new Error('Pihsiu not support account.from method');
  }

  static fromPrivateKey(privateKey, minerKeys = [], wallet) {
    return new Account(pkToAddress(privateKey), wallet);
  }

  static fromKeystore(keystore, password, nonStrict, wallet) {
    throw new Error('Pihsiu not support account.fromKeystore method');
  }
}

export { Account, isPihsiuPk, pkToAddress, addressToPk };
