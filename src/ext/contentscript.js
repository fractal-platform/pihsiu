import extension from 'extensionizer';
import fs from 'fs';
import log from 'loglevel';
import path from 'path';

if (process.env.NODE_ENV === 'development') {
  log.setLevel('DEBUG');
}

const inpageContent = fs
  .readFileSync(path.join(__dirname, '..', '..', 'dist', 'extensions', 'inpage.js'))
  .toString();
const inpageSuffix = '//# sourceURL=' + extension.runtime.getURL('inpage.js') + '\n';
const inpageBundle = inpageContent + inpageSuffix;

// Eventually this streaming injection could be replaced with:
// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Language_Bindings/Components.utils.exportFunction
//
// But for now that is only Firefox
// If we create a FireFox-only code path using that API,

if (shouldInjectWeb3()) {
  injectScript(inpageBundle);
  start();
}

/**
 * Injects a script tag into the current document
 *
 * @param {string} content - Code to be executed in the current document
 */
function injectScript(content) {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('async', false);
    scriptTag.textContent = content;
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
  } catch (e) {
    console.error('Pihsiu script injection failed', e);
  }
}

/**
 * Sets up the stream communication and submits site metadata
 *
 */
async function start() {
  setupTwoWayCommunication();
  await domIsReady();
}

function setupTwoWayCommunication() {
  window.addEventListener('message', _onWindowMessage, false);

  const extensionPort = extension.runtime.connect({ name: 'contentscript' });
  extensionPort.onMessage.addListener(_onPortMessage);

  // extensionPort.onDisconnect.addListener(_onDisconnect.bind(this))

  function _onWindowMessage(event) {
    if (event.data.target === 'PihsiuContent') {
      const msg = { ...event.data, origin: window.location.origin };
      log.debug('inpage->back', msg);
      extensionPort.postMessage(msg);
    }
  }

  function _onPortMessage(msg) {
    log.debug('back->inpage', msg);
    const target = 'PihsiuInpage';
    window.postMessage({ ...msg, target }, window.location.origin);
  }
}

/**
 * Determines if Web3 should be injected
 *
 * @returns {boolean} {@code true} if Web3 should be injected
 */
function shouldInjectWeb3() {
  return doctypeCheck() && suffixCheck() && documentElementCheck() && !blacklistedDomainCheck();
}

/**
 * Checks the doctype of the current document if it exists
 *
 * @returns {boolean} {@code true} if the doctype is html or if none exists
 */
function doctypeCheck() {
  const doctype = window.document.doctype;
  if (doctype) {
    return doctype.name === 'html';
  } else {
    return true;
  }
}

/**
 * Returns whether or not the extension (suffix) of the current document is prohibited
 *
 * This checks {@code window.location.pathname} against a set of file extensions
 * that should not have web3 injected into them. This check is indifferent of query parameters
 * in the location.
 *
 * @returns {boolean} whether or not the extension of the current document is prohibited
 */
function suffixCheck() {
  const prohibitedTypes = [/\.xml$/, /\.pdf$/];
  const currentUrl = window.location.pathname;
  for (let i = 0; i < prohibitedTypes.length; i++) {
    if (prohibitedTypes[i].test(currentUrl)) {
      return false;
    }
  }
  return true;
}

/**
 * Checks the documentElement of the current document
 *
 * @returns {boolean} {@code true} if the documentElement is an html node or if none exists
 */
function documentElementCheck() {
  const documentElement = document.documentElement.nodeName;
  if (documentElement) {
    return documentElement.toLowerCase() === 'html';
  }
  return true;
}

/**
 * Checks if the current domain is blacklisted
 *
 * @returns {boolean} {@code true} if the current domain is blacklisted
 */
function blacklistedDomainCheck() {
  const blacklistedDomains = [
    'uscourts.gov',
    'dropbox.com',
    'webbyawards.com',
    'cdn.shopify.com/s/javascripts/tricorder/xtld-read-only-frame.html',
    'adyen.com',
    'gravityforms.com',
    'harbourair.com',
    'ani.gamer.com.tw',
    'blueskybooking.com',
    'sharefile.com',
  ];
  const currentUrl = window.location.href;
  let currentRegex;
  for (let i = 0; i < blacklistedDomains.length; i++) {
    const blacklistedDomain = blacklistedDomains[i].replace('.', '\\.');
    currentRegex = new RegExp(`(?:https?:\\/\\/)(?:(?!${blacklistedDomain}).)*$`);
    if (!currentRegex.test(currentUrl)) {
      return true;
    }
  }
  return false;
}

/**
 * Returns a promise that resolves when the DOM is loaded (does not wait for images to load)
 */
async function domIsReady() {
  // already loaded
  if (['interactive', 'complete'].includes(document.readyState)) return;
  // wait for load
  await new Promise(resolve =>
    window.addEventListener('DOMContentLoaded', resolve, { once: true }),
  );
}
