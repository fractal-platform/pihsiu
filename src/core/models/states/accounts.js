import { normalize } from 'eth-sig-util';
import log from 'loglevel';

export default {
  namespace: 'accounts',
  state: {
    identities: {},
    selectedAddress: '',
    keyringTypes: [],
    keyrings: [],
    vault: '',
    isSeedWordsSaved: false,
  },
  reducers: {
    update: (state, action) => {
      if(typeof action.isSeedWordsSaved === 'boolean' && !action.isSeedWordsSaved){
        log.error('Try to reset isSeedWordsSaved to false, very strange, the action is ', action);
        // force isSeedWordsSaved to be true
        action.isSeedWordsSaved = true;
      }

      return {
        ...state,
        ...action,
      };
    },

    /**
     * Updates identities to only include specified addresses. Removes identities
     * not included in addresses array
     *
     * @param {string[]} addresses An array of hex addresses
     *
     */
    setAddresses: (state, addresses) => {
      const oldIdentities = state.identities;

      const identities = addresses.reduce((ids, address, index) => {
        const oldId = oldIdentities[address] || {};
        ids[address] = { name: `Account ${index + 1}`, address, ...oldId };
        return ids;
      }, {});

      return { ...state, identities };
    },

    /**
     * Adds addresses to the identities object without removing identities
     *
     * @param {string[]} addresses An array of hex addresses
     *
     */
    addAddresses: (state, addresses) => {
      const identities = state.identities;
      addresses.forEach(address => {
        // skip if already exists
        if (identities[address]) return;
        // add missing identity
        const identityCount = Object.keys(identities).length;
        identities[address] = { name: `Account ${identityCount + 1}`, address };
      });

      return { ...state, identities };
    },

    setSelectedAddress: (state, address) => {
      const selectedAddress = normalize(address);
      return { ...state, selectedAddress };
    },

    selectFirstIdentity: state => {
      const { identities } = state;
      const address = Object.keys(identities)[0];
      const selectedAddress = normalize(address);
      return { ...state, selectedAddress };
    },

    updateNickName: (state, { address, name }) => {
      const { identities } = state;
      if (identities[address] && name) {
        identities[address].name = name;
      }
      return {
        ...state,
        identities,
      };
    },

    saveSeedWords: (state, _) => {
      return {
        ...state,
        isSeedWordsSaved: true,
      };
    },
  },

  filter(state) {
    const a = { ...state };
    delete a.isUnlocked;
    return a;
  },
};
