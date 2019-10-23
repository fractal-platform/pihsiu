import log from 'loglevel';
import { ACCOUNT_URL, TRANSACTION_DETAIL } from '../URL_ENUM';
import NotificationManager from './notification-manager';
import { isEdge } from '../../core/utils';

const extension = require('extensionizer');
const ExtensionLocalStore = require('../lib/local-store');
const extensionStore = new ExtensionLocalStore(); //origin named localStore

export default class ExtensionPlatform {
  //
  // Public
  //
  constructor() {
    this.notificationManager = new NotificationManager();
  }

  updateBadge(label) {
    extension.browserAction.setBadgeText({ text: label });
    extension.browserAction.setBadgeBackgroundColor({ color: '#506F8B' });
  }

  reload() {
    extension.runtime.reload();
  }

  openWindow({ url }) {
    extension.tabs.create({ url });
  }

  openContractInfoWindow({ contractAddress, scanUrl }) {
    log.debug('extension:openContractInfoWindow');
    let url;
    try {
      const contractURL = new URL(`${ACCOUNT_URL}${contractAddress}`, scanUrl);
      url = contractURL.href;
    } catch (e) {
      log.error(e);
      url = undefined;
    }
    this.openWindow({ url });
  }

  saveAbi(contractAddress, abi) {
    try {
      let obj = JSON.parse(abi);
      extensionStore.set({
        [contractAddress]: obj,
      });
    } catch (e) {
      throw new Error('custom error');
    }
  }

  async loadAbi(contractAddress) {
    const versionedData = await extensionStore.get();
    return versionedData ? versionedData[contractAddress] : {};
  }

  removeAbi(contractAddress) {
    extensionStore.remove(contractAddress);
  }

  closeCurrentWindow() {
    extension.windows.getCurrent(windowDetails => {
      extension.windows.get(windowDetails.id, {}, win => {
        if (win) {
          console.log('Remove the window with id ', windowDetails.id);
          extension.windows.remove(windowDetails.id);
        }
      });
    });
  }

  getVersion() {
    return extension.runtime.getManifest().version;
  }

  openExtensionInBrowser(route = null, queryString = null) {
    const extensionURL = this._concatUrl(route, queryString);
    this.openWindow({ url: extensionURL });
  }

  getPlatformInfo(cb) {
    try {
      extension.runtime.getPlatformInfo(platform => {
        cb(null, platform);
      });
    } catch (e) {
      cb(e);
    }
  }

  showTransactionNotification(txMeta, scanUrl, txHash) {
    const { status } = txMeta;

    if (status === 'confirmed') {
      let transactionURL = undefined;
      try {
        const baseURL = new URL(`${TRANSACTION_DETAIL}${txHash}`, scanUrl);
        transactionURL = baseURL.href;
      } catch (e) {
        log.error(e);
        transactionURL = undefined;
      }
      this._showConfirmedTransaction(txMeta, transactionURL);
    } else if (status === 'failed') {
      this._showFailedTransaction(txMeta);
    } else if (status === 'timeout') {
      this._showFailedTransaction(txMeta, 'timeout');
    }
  }

  showpopup(route = null, queryString = null) {
    const extensionURL = this._concatUrl(route, queryString);
    this.notificationManager.showPopup(extensionURL);
  }

  closepopup() {
    return new Promise((resolve, reject) => {
      this.notificationManager.closePopup(resolve, reject);
    });
  }

  /**
   *
   * @param txMeta{transaction}
   * @private
   */
  _showConfirmedTransaction(txMeta, scanUrl) {
    this._subscribeToNotificationClicked();

    const title = 'Confirmed transaction';
    const message = `Transaction ${txMeta.hash} confirmed! View on Explorer`;
    this._showNotification(title, message, scanUrl);
  }

  _showFailedTransaction(txMeta, errorMessage) {
    const title = 'Failed transaction';
    if (!errorMessage) {
      if (txMeta && txMeta.err && txMeta.err.message) {
        errorMessage = txMeta.err.message;
      } else {
        errorMessage = '';
      }
    }
    const message = `Transaction ${txMeta.hash} failed! ${errorMessage}`;
    this._showNotification(title, message);
  }

  _showNotification(title, message, url) {
    //edge don't allow special charactor in the first parameter of create function
    //so replace url to a empty string
    if (isEdge()) {
      url = '';
    }
    extension.notifications.create(url, {
      type: 'basic',
      title: title,
      iconUrl: extension.extension.getURL('../images/logo32.png'),
      message: message,
    });
  }

  _subscribeToNotificationClicked() {
    if (!extension.notifications.onClicked.hasListener(this._viewOnExplorer)) {
      extension.notifications.onClicked.addListener(this._viewOnExplorer);
    }
  }

  _viewOnExplorer(notificationId) {
    if (notificationId.startsWith('http://') || notificationId.startsWith('https://')) {
      extension.tabs.create({ url: notificationId });
    }
  }

  _concatUrl(route, queryString) {
    let extensionURL = extension.runtime.getURL('home.html');

    if (route) {
      extensionURL += `#${route}`;
    }

    if (queryString) {
      extensionURL += `?${queryString}`;
    }

    return extensionURL;
  }
}
