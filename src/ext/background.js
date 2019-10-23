import extension from 'extensionizer';
import log from 'loglevel';
import { BootEngine } from '../core';
import { isInternalWindow, isEdge } from '../core/utils';
import ExtensionPlatform from './platforms/extension';
const storeTransform = require('obs-store/lib/transform');
const debounce = require('debounce-stream');
const pump = require('pump');
const asStream = require('obs-store/lib/asStream');
const createStreamSink = require('./lib/createStreamSink');
const ExtensionLocalStore = require('./lib/local-store');
const EdgeEncryptor = require('./edge-encryptor');

async function initialize() {
  const initState = await loadStateFromPersistence();
  await setupBootEngine(initState);
  log.debug('Pihsiu initialization complete.');
}

const extensionStore = new ExtensionLocalStore(); //origin named localStore
let versionedData = {};

const platform = new ExtensionPlatform();

async function loadStateFromPersistence() {
  // return just the data
  versionedData = await extensionStore.get();
  return versionedData ? versionedData.data : {};
}

function setupBootEngine(initState) {
  const bootEngine = new BootEngine({
    // User confirmation callbacks:
    // showUnconfirmedMessage: triggerUi,
    // showUnapprovedTx: triggerUi,
    // openPopup: openPopup,
    // closePopup: notificationManager.closePopup.bind(notificationManager),

    // initial state
    initState,

    // initial locale chainid
    // initLangCode, remove now

    // platform specific api
    platform,
    encryptor: isEdge() ? new EdgeEncryptor() : undefined,
  });

  const modelProxy = new Proxy(bootEngine.models, {
    get: function(target, property) {
      if (property in target) {
        return target[property];
      } else if (property === 'getState') {
        return () => target.persist;
      } else {
        throw new ReferenceError('Property "' + property + '" does not exist.');
      }
    },
  });

  pump(
    asStream(modelProxy),
    debounce(1000),
    storeTransform(versionifyData),
    createStreamSink(persistData),
    error => {
      log.error('Pihsiu - Persistence pipeline failed', error);
    },
  );

  function versionifyData(state) {
    let versionedData = {};

    versionedData.data = state;
    return versionedData;
  }

  async function persistData(state) {
    if (!state) {
      throw new Error('Pihsiu - updated state is missing', state);
    }
    if (!state.data) {
      throw new Error('Pihsiu - updated state does not have data', state);
    }
    if (extensionStore.isSupported) {
      try {
        await extensionStore.set(state);
      } catch (err) {
        // log error so we dont break the pipeline
        log.error('error setting state in local store:', err);
      }
    }
  }

  extension.runtime.onConnect.addListener(handleConnect);

  if (process.env.NODE_ENV === 'development') {
    extension.runtime.onConnectExternal.addListener(handleConnect);
  }

  function handleConnect(port) {
    log.debug('handle connect: ', port);
    if (isInternalWindow(port.name)) {
      const cb = state => {
        try {
          port.postMessage({
            type: 'pihsiuState/update',
            payload: state,
          });
        } catch (e) {
          log.error('isInternalWindow', e);
        }
      };
      bootEngine.isClientOpen = true;
      bootEngine.setupTrustedCommunication(port, 'Phisiu');

      bootEngine.on('update', cb);

      port.onDisconnect.addListener(() => {
        bootEngine.off('update', cb);
      });
    } else {
      bootEngine.setupContentCommunication(port, 'Phisiu');
    }
  }
}

if (process.env.NODE_ENV === 'development') {
  log.setLevel('DEBUG');
}
// initialization flow
initialize().catch(log.error);
