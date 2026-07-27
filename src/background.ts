// Background service worker entry point — registers message listeners only.

import browser from "webextension-polyfill";
import {
  handleSendToSheet,
  handleTestConnection,
  handleFetchLeads,
  handleFlushSheet,
} from "./background/handlers";
import { handleGenerateAiEmail } from "./background/handlers/aiHandler";
import type { ExtensionMessage, MessageResponse } from "./shared/types";
import { MESSAGE_TYPES } from "./shared/constants";

browser.runtime.onInstalled.addListener(({ reason }) => {
  console.log("[GH Extractor] Installed. Reason:", reason);
});

// Open options page when user clicks the extension toolbar icon
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender,
    sendResponse: (r: MessageResponse) => void,
  ) => {
    if (message.type === MESSAGE_TYPES.SEND_TO_SHEET) {
      handleSendToSheet(message.payload).then(sendResponse);
      return true; // keep message channel open for async response
    }

    if (message.type === MESSAGE_TYPES.TEST_CONNECTION) {
      handleTestConnection(message.scriptUrl).then(sendResponse);
      return true;
    }

    if (message.type === MESSAGE_TYPES.FETCH_LEADS) {
      handleFetchLeads(message.sheetName).then(sendResponse);
      return true;
    }

    if (message.type === MESSAGE_TYPES.FLUSH_SHEET) {
      handleFlushSheet(message.sheetName).then(sendResponse);
      return true;
    }

    if (message.type === MESSAGE_TYPES.GENERATE_AI_EMAIL) {
      handleGenerateAiEmail(message).then(sendResponse);
      return true;
    }
  },
);
