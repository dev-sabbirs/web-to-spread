// CSS injected into GitHub pages as a <style> tag by the content script.
// Uses Tailwind CSS utility styles compiled for raw injection into host pages.

import { ELEMENT_IDS } from '../shared/constants';

const { BUTTON, TOAST } = ELEMENT_IDS;

export const CONTENT_STYLES = `
  #${BUTTON} {
    position: fixed;
    bottom: 1.75rem;
    left: 1.75rem;
    z-index: 2147483647;
    width: 3.25rem;
    height: 3.25rem;
    border-radius: 9999px;
    background-image: linear-gradient(to bottom right, #6366f1, #8b5cf6);
    border: none;
    cursor: pointer;
    box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4), 0 4px 6px -4px rgba(99, 102, 241, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    color: #ffffff;
    padding: 0;
    outline: 2px solid transparent;
    overflow: hidden;
  }
  #${BUTTON} img {
    width: 26px;
    height: 26px;
    object-fit: contain;
    pointer-events: none;
  }
  #${BUTTON}:hover {
    transform: scale(1.1) translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.5), 0 8px 10px -6px rgba(99, 102, 241, 0.5);
  }
  #${BUTTON}:active {
    transform: scale(0.95);
  }
  #${BUTTON}.ghe-loading {
    animation: ghe-pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    pointer-events: none;
  }
  @keyframes ghe-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.6; transform: scale(0.96); }
  }
  #${TOAST} {
    position: fixed;
    bottom: 5.75rem;
    left: 1.75rem;
    z-index: 2147483647;
    background-color: #161b22;
    color: #f3f4f6;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 0.8125rem;
    max-width: 18rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5), 0 0 0 1px #30363d;
    border-left: 4px solid #6366f1;
    animation: ghe-slide 0.2s cubic-bezier(0, 0, 0.2, 1);
    line-height: 1.5;
    white-space: pre-line;
  }
  #${TOAST}.ghe-success { border-left-color: #22c55e; }
  #${TOAST}.ghe-error   { border-left-color: #ef4444; }
  @keyframes ghe-slide {
    from { transform: translateX(-1rem); opacity: 0; }
    to   { transform: translateX(0); opacity: 1; }
  }
`;
