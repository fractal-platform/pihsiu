import { TextDecoder, TextEncoder } from 'text-encoding';

export { cleanErrorStack } from './cleanErrorStack';
export { mix } from './mixin';
export { createRandomId } from './randomId';
export * from './windowType';

function isIE() {
  return !!document.documentMode;
}

export function isEdge() {
  return !window.TextEncoder && !window.TextDecoder;
}

export function getTextCodingFunction() {
  if (isEdge()) {
    return {
      TextDecoder,
      TextEncoder,
    };
  }
  return {
    TextEncoder: window.TextEncoder,
    TextDecoder: window.TextDecoder,
  };
}
