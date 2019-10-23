import log from 'loglevel';

export default class WindowConnector {
  constructor() {
    //init
    //wait
    //pass
    //rejected
    this.status = 'init';
  }

  addListener(cb) {
    window.addEventListener(
      'message',
      msg => {
        if (msg.data.target === 'PihsiuInpage') {
          if (this.status === 'wait' && msg.data.auth) {
            this.status = msg.data.auth;
          }
          cb(msg.data);
        }
      },
      false,
    );
  }

  send(msg) {
    if (this.status === 'init') {
      msg.siteMeta = getSiteMetadata();
      msg.target = 'PihsiuContent';
      window.postMessage(msg, window.location.origin);

      this.status = 'wait';
      return;
    } else if (this.status === 'wait') {
      //todo lyjtodo
      log.debug('wait');
      return;
    } else if (this.status === 'pass') {
      msg.target = 'PihsiuContent';
      window.postMessage(msg, window.location.origin);
      return;
    } else if (this.status === 'rejected') {
      msg.target = 'PihsiuInpage';
      window.postMessage({
        ...msg,
        error: 'User rejected',
      }, window.location.origin);
      return;
    }
  }
}

function getSiteMetadata() {
  const metadata = {
    origin: window.location.origin,
    name: getSiteName(window),
    icon: getSiteIcon(window),
  };
  return metadata;
}

function getSiteName(window) {
  const document = window.document;
  const siteName = document.querySelector('head > meta[property="og:site_name"]');
  if (siteName) {
    return siteName.content;
  }

  const metaTitle = document.querySelector('head > meta[name="title"]');
  if (metaTitle) {
    return metaTitle.content;
  }

  return document.title;
}

function getSiteIcon(window) {
  const document = window.document;

  // Use the site's favicon if it exists
  const shortcutIcon = document.querySelector('head > link[rel="shortcut icon"]');
  if (shortcutIcon) {
    return shortcutIcon.href;
  }

  // Search through available icons in no particular order
  const icon = Array.from(document.querySelectorAll('head > link[rel="icon"]')).find(icon =>
    Boolean(icon.href),
  );
  if (icon) {
    return icon.href;
  }

  return null;
}
