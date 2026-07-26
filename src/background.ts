// Background service worker entry point — registers message listeners only.

import browser from 'webextension-polyfill';
import { handleSendToSheet, handleTestConnection } from './background/handlers';
import type { ExtensionMessage, MessageResponse } from './shared/types';
import { MESSAGE_TYPES } from './shared/constants';

browser.runtime.onInstalled.addListener(({ reason }) => {
  console.log('[GH Extractor] Installed. Reason:', reason);
});

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse: (r: MessageResponse) => void) => {
    if (message.type === MESSAGE_TYPES.SEND_TO_SHEET) {
      handleSendToSheet(message.payload).then(sendResponse);
      return true; // keep message channel open for async response
    }

    if (message.type === MESSAGE_TYPES.TEST_CONNECTION) {
      handleTestConnection(message.scriptUrl).then(sendResponse);
      return true;
    }
  },
);
