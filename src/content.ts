// Content script entry point — orchestrates injection and GitHub SPA re-init.

import { ELEMENT_IDS } from './shared/constants';
import { CONTENT_STYLES } from './content/styles';
import { injectButton } from './content/button';

function injectStyles(): void {
  if (document.getElementById(ELEMENT_IDS.STYLES)) return;
  const style = document.createElement('style');
  style.id = ELEMENT_IDS.STYLES;
  style.textContent = CONTENT_STYLES;
  document.head.appendChild(style);
}

function init(): void {
  injectStyles();
  injectButton();
}

// Bootstrap on first load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// GitHub uses SPA navigation — re-inject after URL changes
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(init, 500); // wait for GitHub to finish rendering
  }
}).observe(document.body, { childList: true, subtree: true });
