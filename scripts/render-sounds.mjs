// Render the installed Cuelume engine offline once; Expo Go plays the bundled WAVs.
// npm run sounds:render (requires Playwright Chromium, or SOUND_BROWSER_CHANNEL=msedge).
// Pass cue names after `--` to render only those files; all cues use the bubble theme.
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(project, "node_modules/cuelume/dist");
const output = resolve(project, "assets/sounds");
const server = createServer(async (request, response) => {
      if (request.url === "/") {
            response.setHeader("Content-Type", "text/html");
            response.end('<button id="activate">Render audio</button>');
            return;
      }
      const path = resolve(source, `.${new URL(request.url, "http://localhost").pathname}`);
      if (relative(source, path).startsWith("..")) {
            response.writeHead(403).end();
            return;
      }
      try {
            response.setHeader("Content-Type", "text/javascript");
            response.end(await readFile(path));
      } catch {
            response.writeHead(404).end();
      }
});

function wav(samples, rate) {
      const buffer = Buffer.alloc(44 + samples.length * 2);
      buffer.write("RIFF", 0);
      buffer.writeUInt32LE(buffer.length - 8, 4);
      buffer.write("WAVEfmt ", 8);
      buffer.writeUInt32LE(16, 16);
      buffer.writeUInt16LE(1, 20);
      buffer.writeUInt16LE(1, 22);
      buffer.writeUInt32LE(rate, 24);
      buffer.writeUInt32LE(rate * 2, 28);
      buffer.writeUInt16LE(2, 32);
      buffer.writeUInt16LE(16, 34);
      buffer.write("data", 36);
      buffer.writeUInt32LE(samples.length * 2, 40);
      samples.forEach((sample, i) => buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), 44 + i * 2));
      return buffer;
}

const allCues = [
      "tap", "select", "select-back", "toggle", "open", "open-strong", "close",
      "navigate", "navigate-strong", "navigate-back", "error", "type", "type-delete", "type-enter",
];
const requestedCues = process.argv.slice(2);
const invalidCues = requestedCues.filter((name) => !allCues.includes(name));
if (invalidCues.length) throw new Error(`Unknown cue(s): ${invalidCues.join(", ")}`);
const cues = requestedCues.length ? requestedCues : allCues;

await mkdir(output, { recursive: true });
await new Promise((done) => server.listen(0, "127.0.0.1", done));
let browser;
try {
      browser = await chromium.launch({ headless: true, ...(process.env.SOUND_BROWSER_CHANNEL ? { channel: process.env.SOUND_BROWSER_CHANNEL } : {}) });
      const page = await browser.newPage();
      for (const name of cues) {
            await page.goto(`http://127.0.0.1:${server.address().port}`);
            await page.locator("#activate").click();
            const samples = await page.evaluate(async (name) => {
                  const rate = 44100;
                  const context = new OfflineAudioContext(2, rate * 2, rate);
                  // Cuelume's scheduling needs a running AudioContext; render offline instead.
                  Object.defineProperty(context, "state", { value: "running" });
                  window.AudioContext = function () {
                        return context;
                  };
                  const { play } = await import("/index.js");
                  const timeout = window.setTimeout;
                  window.setTimeout = () => 0;
                  try {
                        const cue = name.startsWith("type") ? "type" : name.replace(/-(back|strong)$/, "");
                        play(cue, {
                              emphasis: name.endsWith("strong") ? "strong" : name.startsWith("type") ? "subtle" : "normal",
                              input: name.startsWith("type") ? "keyboard" : "touch",
                              key: name === "type-delete" ? "delete" : name === "type-enter" ? "enter" : "printable",
                              direction: name.endsWith("back") ? "back" : "forward",
                              theme: "bubble",
                        });
                  } finally {
                        window.setTimeout = timeout;
                  }
                  const audio = await context.startRendering();
                  const left = audio.getChannelData(0);
                  const right = audio.getChannelData(1);
                  const mono = Array.from(left, (value, i) => (value + right[i]) / 2);
                  let end = mono.length - 1;
                  while (end > 0 && Math.abs(mono[end]) < 0.0001) end--;
                  return mono.slice(0, Math.min(end + 442, mono.length));
            }, name);
            if (!samples.some((sample) => Math.abs(sample) > 0.0001)) throw new Error(`Silent cue: ${name}`);
            await writeFile(resolve(output, `${name}.wav`), wav(samples, 44100));
            console.log(`${name}: ${Math.round(samples.length / 44.1)} ms`);
      }
      await writeFile(resolve(output, "LICENSE-cuelume.txt"), await readFile(resolve(project, "node_modules/cuelume/LICENSE")));
} finally {
      await browser?.close();
      await new Promise((done) => server.close(done));
}
