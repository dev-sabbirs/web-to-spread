// Content script entry point — orchestrates injection and GitHub SPA re-init.

import { ELEMENT_IDS } from './shared/constants';
import { CONTENT_STYLES } from './content/styles';
import { injectButton } from './content/button';

function isExtensionValid(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
}

function injectStyles(): void {
  if (!isExtensionValid() || document.getElementById(ELEMENT_IDS.STYLES)) return;
  const style = document.createElement('style');
  style.id = ELEMENT_IDS.STYLES;
  style.textContent = CONTENT_STYLES;
  document.head.appendChild(style);
}

function init(): void {
  if (!isExtensionValid()) return;
  injectStyles();
  injectButton();
}

// Bootstrap on first load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// GitHub & LinkedIn SPA navigation observer — disconnected if context invalidated
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  if (!isExtensionValid()) {
    observer.disconnect();
    return;
  }
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(init, 500);
  }
});

observer.observe(document.body, { childList: true, subtree: true });
