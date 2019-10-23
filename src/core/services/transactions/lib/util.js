import { addHexPrefix, isValidAddress } from 'ethereumjs-util';

// functions that handle normalizing of that key in txParams
const normalizers = {
  from: (from, LowerCase = true) =>
    LowerCase ? addHexPrefix(from).toLowerCase() : addHexPrefix(from),
  to: (to, LowerCase = true) => (LowerCase ? addHexPrefix(to).toLowerCase() : addHexPrefix(to)),
  nonce: nonce => nonce,
  value: value => value,
  data: data => addHexPrefix(data),
  gas: gas => (gas ? gas : 1),
  gasPrice: gasPrice => (gasPrice ? gasPrice : 21000),
};

/**
 normalizes txParams
 @param txParams {object}
 @returns {object} normalized txParams
 */
export function normalizeTxParams(txParams, LowerCase) {
  // apply only keys in the normalizers
  txParams.gasPrice = txParams.gasPrice || '1';
  txParams.gas = txParams.gas || 2000000;
  const normalizedTxParams = {};
  for (const key in normalizers) {
    if (txParams[key]) normalizedTxParams[key] = normalizers[key](txParams[key], LowerCase);
  }
  return normalizedTxParams;
}

/**
 validates txParams
 @param txParams {object}
 */
export function validateTxParams(txParams) {
  validateFrom(txParams);
  validateRecipient(txParams);
  if ('value' in txParams) {
    const value = txParams.value.toString();
    if (value.includes('-')) {
      throw new Error(`Invalid transaction value of ${txParams.value} not a positive number.`);
    }

    if (value.includes('.')) {
      throw new Error(`Invalid transaction value of ${txParams.value} number must be in wei`);
    }
  }
}

/**
 validates the from field in  txParams
 @param txParams {object}
 */
export function validateFrom(txParams) {
  if (!(typeof txParams.from === 'string'))
    throw new Error(`Invalid from address ${txParams.from} not a string`);
  if (!isValidAddress(txParams.from)) throw new Error('Invalid from address');
}

/**
 validates the to field in  txParams
 @param txParams {object}
 */
export function validateRecipient(txParams) {
  if (txParams.to === '0x' || txParams.to === null) {
    if (txParams.data) {
      delete txParams.to;
    } else {
      throw new Error('Invalid recipient address');
    }
  } else if (txParams.to !== undefined && !isValidAddress(txParams.to)) {
    throw new Error('Invalid recipient address');
  }
  return txParams;
}
