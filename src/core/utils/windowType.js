import { windowType } from '../Enums';

export function getWindowType(url = window.location.href) {
  if (url.match(/popup.html.*$/)) {
    return windowType.POPUP;
  } else if (url.match(/home.html.*$/)) {
    return windowType.FULL_SCREEN;
  } else if (url.match(/\/#\/.*$/)) {
    return windowType.WEB_PAGE;
  } else {
    return windowType.NOTIFICATION;
  }
}

export function isInternalWindow(type) {
  return type !== windowType.DAPP;
}
