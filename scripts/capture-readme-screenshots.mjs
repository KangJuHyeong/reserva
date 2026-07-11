import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const WebSocketClient = globalThis.WebSocket ?? require("../frontend/node_modules/next/dist/compiled/ws");

const chromePath = process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const frontendBaseUrl = process.env.FRONTEND_BASE_URL ?? "http://localhost:3000";
const backendBaseUrl = process.env.BACKEND_BASE_URL ?? "http://localhost:8080";
const outputDir = resolve(process.env.README_SCREENSHOT_DIR ?? "docs/assets/readme");
const chromeProfileDir = resolve(process.env.README_CHROME_PROFILE_DIR ?? ".tmp/readme-chrome-profile");
const debuggingPort = Number(process.env.CHROME_DEBUGGING_PORT ?? 9222);

const screenshots = [
  { name: "home-discovery.png", path: "/", account: "user" },
  { name: "event-detail.png", path: "/reservation/evt_demo_jazz", account: "user" },
  { name: "booking-detail.png", path: "/booking/BK-2026-DEMOJAZZ", account: "user" },
  { name: "dashboard.png", path: "/dashboard", account: "user" },
  { name: "host-events.png", path: "/my-events", account: "host" },
  { name: "create-event.png", path: "/create", account: "host" },
];

const accounts = {
  user: { email: "alex@example.com", password: "dev-password" },
  host: { email: "creator@example.com", password: "dev-password" },
};

let nextMessageId = 1;

async function login(account) {
  const response = await fetch(`${backendBaseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(account),
  });

  if (!response.ok) {
    throw new Error(`Login failed for ${account.email}: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  return payload.accessToken;
}

async function waitForDebuggerUrl() {
  const versionUrl = `http://127.0.0.1:${debuggingPort}/json/version`;
  const startedAt = Date.now();
  while (Date.now() - startedAt < 15_000) {
    try {
      const response = await fetch(versionUrl);
      if (response.ok) {
        const payload = await response.json();
        return payload.webSocketDebuggerUrl;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  throw new Error("Chrome debugging endpoint did not become ready.");
}

function createCdpClient(webSocketUrl) {
  const socket = new WebSocketClient(webSocketUrl);
  const pending = new Map();

  socket.on("message", (data) => {
    const message = JSON.parse(data.toString());
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) {
        reject(new Error(`${message.error.message}: ${JSON.stringify(message.error.data ?? "")}`));
      } else {
        resolve(message.result ?? {});
      }
    }
  });

  function send(method, params = {}, sessionId = undefined) {
    const id = nextMessageId++;
    socket.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  }

  return new Promise((resolve, reject) => {
    socket.on("open", () => resolve({ send, close: () => socket.close() }));
    socket.on("error", reject);
  });
}

async function waitForPageLoad(client, sessionId) {
  await new Promise((resolve) => setTimeout(resolve, 2500));
  await client.send("Runtime.evaluate", {
    expression: "document.fonts && document.fonts.ready ? document.fonts.ready.then(() => true) : true",
    awaitPromise: true,
  }, sessionId);
}

async function capture(client, sessionId, token, target) {
  await client.send("Network.setCookie", {
    name: "reserva_auth_token",
    value: token,
    url: frontendBaseUrl,
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
  }, sessionId);

  await client.send("Page.navigate", { url: `${frontendBaseUrl}${target.path}` }, sessionId);
  await waitForPageLoad(client, sessionId);

  const metrics = await client.send("Page.getLayoutMetrics", {}, sessionId);
  const width = 1440;
  const height = Math.min(Math.max(Math.ceil(metrics.cssContentSize?.height ?? 1100), 900), 2200);
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  }, sessionId);
  await waitForPageLoad(client, sessionId);

  const screenshot = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: true,
  }, sessionId);

  await writeFile(`${outputDir}/${target.name}`, Buffer.from(screenshot.data, "base64"));
  console.log(`Captured ${target.name}`);
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  await mkdir(chromeProfileDir, { recursive: true });

  const tokens = {
    user: await login(accounts.user),
    host: await login(accounts.host),
  };

  const chrome = spawn(chromePath, [
    "--headless=new",
    "--no-sandbox",
    `--remote-debugging-port=${debuggingPort}`,
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=1440,1100",
    `--user-data-dir=${chromeProfileDir}`,
    "about:blank",
  ], {
    stdio: ["ignore", "ignore", "inherit"],
  });

  try {
    const webSocketUrl = await waitForDebuggerUrl();
    const client = await createCdpClient(webSocketUrl);
    const target = await client.send("Target.createTarget", { url: "about:blank" });
    const attached = await client.send("Target.attachToTarget", { targetId: target.targetId, flatten: true });
    const sessionId = attached.sessionId;
    await client.send("Page.enable", {}, sessionId);
    await client.send("Network.enable", {}, sessionId);
    await client.send("Runtime.enable", {}, sessionId);

    for (const screenshotTarget of screenshots) {
      await capture(client, sessionId, tokens[screenshotTarget.account], screenshotTarget);
    }

    client.close();
  } finally {
    chrome.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
