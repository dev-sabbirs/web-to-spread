// CSS injected into GitHub pages as a <style> tag by the content script.
// Uses Tailwind CSS utility styles compiled for raw injection into host pages.

import { ELEMENT_IDS } from '../shared/constants';

const { BUTTON, TOAST } = ELEMENT_IDS;

export const CONTENT_STYLES = `
  #${BUTTON}, #${BUTTON} * {
    cursor: pointer !important;
  }
  #${BUTTON} {
    position: fixed;
    bottom: 2.25rem;
    left: 2.25rem;
    z-index: 2147483647;
    height: 4rem;
    padding: 0 1.35rem 0 0.85rem;
    border-radius: 9999px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.98), rgba(168, 85, 247, 0.98));
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1.5px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 12px 30px -4px rgba(99, 102, 241, 0.55), 0 8px 16px -4px rgba(168, 85, 247, 0.45);
    display: flex;
    align-items: center;
    gap: 0.85rem;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    color: #ffffff;
    outline: none;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    user-select: none;
    animation: w2s-float 3.5s ease-in-out infinite;
  }
  @keyframes w2s-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
  #${BUTTON} .w2s-icon-wrapper {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
    transition: transform 0.3s ease;
    animation: w2s-sparkle-pulse 2.5s ease-in-out infinite;
  }
  @keyframes w2s-sparkle-pulse {
    0%, 100% { transform: scale(1); opacity: 0.9; }
    50% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 0 6px rgba(255,255,255,0.8)); }
  }
  #${BUTTON} img, #${BUTTON} svg {
    width: 22px;
    height: 22px;
    object-fit: contain;
    pointer-events: none;
  }
  #${BUTTON} .w2s-label {
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    color: #ffffff;
    white-space: nowrap;
    opacity: 1;
    text-shadow: 0 1px 3px rgba(0,0,0,0.3);
    transition: opacity 0.2s ease;
  }
  #${BUTTON}:hover {
    animation-play-state: paused;
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 22px 38px -5px rgba(99, 102, 241, 0.65), 0 12px 18px -5px rgba(168, 85, 247, 0.55);
    border-color: rgba(255, 255, 255, 0.55);
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.98), rgba(147, 51, 234, 0.98));
  }
  #${BUTTON}:hover .w2s-icon-wrapper {
    animation-play-state: paused;
    transform: rotate(15deg) scale(1.12);
  }
  #${BUTTON}:active {
    transform: translateY(0) scale(0.96);
    box-shadow: 0 5px 15px -3px rgba(99, 102, 241, 0.4);
  }
  #${BUTTON}.ghe-loading {
    pointer-events: none;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9));
  }
  #${BUTTON}.ghe-loading .w2s-icon-wrapper {
    animation: w2s-spin 0.8s linear infinite;
  }
  #${BUTTON}.w2s-success {
    background: linear-gradient(135deg, #10b981, #059669) !important;
    border-color: rgba(255, 255, 255, 0.7) !important;
    box-shadow: 0 0 30px 4px rgba(16, 185, 129, 0.7), 0 12px 30px -4px rgba(16, 185, 129, 0.8) !important;
    animation: w2s-pop-success 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  }
  @keyframes w2s-pop-success {
    0% { transform: scale(0.9); }
    50% { transform: scale(1.18) translateY(-4px); }
    100% { transform: scale(1) translateY(0); }
  }
  #${BUTTON}.w2s-error {
    background: linear-gradient(135deg, #ef4444, #dc2626) !important;
    border-color: rgba(255, 255, 255, 0.5) !important;
    box-shadow: 0 12px 30px -4px rgba(239, 68, 68, 0.6) !important;
    animation: w2s-shake-error 0.4s ease-in-out !important;
  }
  @keyframes w2s-shake-error {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-6px); }
    40%, 80% { transform: translateX(6px); }
  }
  @keyframes w2s-spin {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.15); }
    100% { transform: rotate(360deg) scale(1); }
  }
  #${TOAST} {
    position: fixed;
    bottom: 6rem;
    left: 2rem;
    z-index: 2147483647;
    background: rgba(22, 27, 34, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: #f3f4f6;
    padding: 0.875rem 1.25rem;
    border-radius: 1rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 0.8125rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    opacity: 0;
    transform: translateY(12px) scale(0.95);
    pointer-events: none;
    line-height: 1.4;
  }
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
