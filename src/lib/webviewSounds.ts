import type { WebViewMessageEvent } from "react-native-webview";
import { playSound, type InteractionCue } from "./interactionSounds";

// Delegate to the page so controls added after loading receive the same feedback.
// Send only a cue name; page text, input values and URLs stay in the WebView.
export const webviewSoundScript = `
(() => {
  if (window.__moviesflixSoundsInstalled) return;
  window.__moviesflixSoundsInstalled = true;
  const send = (cue) => window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'moviesflix:interaction', cue }));
  document.addEventListener('click', (event) => {
    if (!event.isTrusted) return;
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    const control = target?.closest('a[href],button,summary,select,input,[role="button"],[role="tab"],[role="checkbox"],[role="switch"],video');
    if (!control || control.matches(':disabled,[aria-disabled="true"]')) return;
    const role = control.getAttribute('role');
    const type = control.getAttribute('type');
    if (control.tagName === 'INPUT' && !['button','submit','reset','checkbox','radio','range'].includes(type)) return;
    const cue = role === 'tab' || type === 'radio' ? 'select'
      : role === 'checkbox' || role === 'switch' || type === 'checkbox' ? 'toggle'
      : control.tagName === 'SUMMARY' ? (control.parentElement?.open ? 'close' : 'open')
      : control.hasAttribute('aria-expanded') ? (control.getAttribute('aria-expanded') === 'true' ? 'close' : 'open')
      : control.tagName === 'SELECT' ? 'open'
      : control.tagName === 'A' ? 'navigate' : 'tap';
    send(cue);
  }, true);
  document.addEventListener('change', (event) => {
    if (event.isTrusted && event.target?.tagName === 'SELECT') send('select');
  }, true);
})(); true;
`;

const pageCues: readonly InteractionCue[] = ["tap", "select", "toggle", "open", "close", "navigate"];

export function handleWebViewSound({ nativeEvent }: WebViewMessageEvent) {
  try {
    const message = JSON.parse(nativeEvent.data);
    if (message?.type === "moviesflix:interaction" && pageCues.includes(message.cue)) playSound(message.cue);
  } catch {
    // Other messages from the embedded page are unrelated to interaction audio.
  }
}
