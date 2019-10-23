import { round } from 'lodash';

export function totalAmount(amount = 0, gas = 0, gasPrice = 0) {
  return parseFloat(amount) + parseFloat(gas) * parseFloat(gasPrice);
}

export function rgba(hex, transparent = 1) {
  if (hex === undefined || hex === null) return '';

  const rgb = hex.startsWith('#') ? hex.substring(1) : hex;
  const r = parseInt(rgb.substring(0, 2), 16);
  const g = parseInt(rgb.substring(2, 4), 16);
  const b = parseInt(rgb.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${transparent})`;
}

export function bufferToHex(buffer) {
  const hex = Array.prototype.map
    .call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2))
    .join('');

  return `0x${hex}`;
}

function getAbiType(abiObj, typeName) {
  const struct = abiObj.structs.find(s => s.name === typeName);
  if (!struct) {
    return typeName;
  }
  const result = {};
  struct.fields.forEach(f => {
    result[f.name] = getAbiType(abiObj, f.type);
  });
  return result;
}

export function parseAbi(abi) {
  if (!abi) return { actions: [], tables: [] };
  let abiObj;
  if (typeof abi === 'string') {
    abiObj = JSON.parse(abi);
  } else {
    abiObj = abi;
  }

  const actions = abiObj.actions.map(act => {
    const method = abiObj.structs.find(s => s.name === act.type);
    const params = {};
    method.fields.forEach(f => {
      params[f.name] = getAbiType(abiObj, f.type);
    });
    return { name: act.name, params };
  });

  const tables = abiObj.tables.map(table => {
    const tstruct = abiObj.structs.find(s => s.name === table.type);
    const keyStruct = tstruct.fields.find(f => f.name === 'key');
    return {
      name: table.name,
      key: getAbiType(abiObj, keyStruct.type),
      fields: tstruct.fields,
    };
  });

  return { actions, tables };
}

export const FRA = 10 ** 9;
export const MLEI = 10 ** 6;
export const KLEI = 10 ** 3;
export const LEI = 1;

export function toFra(lei, precision) {
  if (lei === undefined || lei === null) {
    lei = 0;
  }
  if (typeof lei === 'string') {
    lei = parseFloat(lei);
  }
  if (precision) {
    return round(lei / FRA, precision);
  }
  let pre = 3;
  for (let i = 0; i < 9; i++) {
    if (Math.round((lei / FRA) * 10 ** i) > 0) {
      return round(lei / FRA, pre);
    }
    pre++;
  }
  return round(lei / FRA, 9);
}

export function fraToLei(fra) {
  if (!fra) fra = 0;
  return Math.round(fra * FRA);
}

export function validJson(jsonStr) {
  if (typeof jsonStr !== 'string') {
    return 'Json is not string';
  }
  try {
    JSON.parse(jsonStr);
  } catch (e) {
    return 'Invalid JSON format';
  }
}

export function validAddress(addr) {
  if (typeof addr !== 'string') return 'Invalid Type';
  if (!addr.startsWith('0x')) return 'Not start with 0x';
  const patten = /^0x[0-9a-fA-F]{40}$/g;
  if (!patten.test(addr)) return 'Invalid address format';
}

export function validAmount(amount, min = null, max = null) {
  let num = amount;
  if (typeof amount === 'string') {
    const patten = /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]+))$/g;
    if (!patten.test(amount)) return 'Invalid Number';
    num = parseFloat(amount);
  }

  if (min !== null && num < min) {
    return `Less than min value: ${min}`;
  }

  if (max !== null && num > max) {
    return `More than max value: ${max}`;
  }
}

export function validHexString(hex, len) {
  const p = /^0x[0-9a-fA-F]+|[0-9a-fA-F]+$/g;
  if (!p.test(hex)) {
    return 'hex string invalid format';
  }
  if (len !== undefined) {
    const actLen = hex.startsWith('0x') ? hex.length - 2 : hex.length;
    if (len !== actLen) return `invalid hex length, need ${len}`;
  }
}

const numberlize = [
  'uint8',
  'int8',
  'uint16',
  'int16',
  'uint32',
  'int32',
  'uint64',
  'int64',
  'uint128',
  'int128',
  'varuint32',
  'varint32',
  'float32',
  'float64',
  'float128',
  'time_point',
  'time_point_sec',
  'block_timestamp_type',
];

export function validAbiData(data, type) {
  if (data === undefined || data === null) {
    return 'is empty';
  }

  if (typeof type !== 'string') {
    type = JSON.stringify(type);
  }

  switch (true) {
    case type.endsWith('[]'):
      if (!data.trim().startsWith('[') || !data.trim().endsWith(']')) {
        return 'should surounded by []';
      }
      break;
    case type.startsWith('{'):
      if (!data.trim().startsWith('{') || !data.trim().endsWith('}')) {
        return 'should surounded by {}';
      }
      break;
    case type === 'bool':
      if (!['true', 'false'].includes(data)) {
        return 'value should be either true or false';
      }
      break;
    case numberlize.includes(type):
      return validAmount(data);
    case type === 'name':
      const p = /[a-z1-5.]*/g;
      if (!p.test(data)) return 'char should be in [a-z1-5] or .';
      break;
    case type === 'checksum160':
      return validHexString(data, 40);
    case type === 'checksum256':
      return validHexString(data, 64);
    case type === 'checksum512':
      return validHexString(data, 128);
    case type === 'address':
      return validHexString(data, 40);
    default:
      break;
  }
}

export function transformAbiData(data, defination) {
  if (!data) return {};
  if (typeof defination === 'string') {
    return _transformEntry(data, defination);
  }
  const result = {};
  Object.keys(data).forEach(name => {
    result[name] = _transformEntry(data[name], defination[name]);
  });
  return result;
}

function _transformEntry(entry, type) {
  const shouldBeStr = [
    'uint64',
    'int64',
    'uint128',
    'int128',
    'float64',
    'float128',
    'time_point',
    'time_point_sec',
    'block_timestamp_type',
  ];

  switch (true) {
    case entry.startsWith('[') || entry.startsWith('{'):
      return JSON.parse(entry);
    case type === 'bool':
      return entry === 'true';
    case shouldBeStr.includes(type):
      return entry;
    case numberlize.includes(type):
      return parseFloat(entry);
    case validHexString(entry) === undefined:
      return entry.startsWith('0x') ? entry.slice(2) : entry;
    default:
      return entry;
  }
}
