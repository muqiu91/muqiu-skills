#!/usr/bin/env node
// 使用本机 Chromium 内核检查 HTML，并截取 #diagram；无第三方包依赖。
import { spawn } from 'node:child_process';
import { constants } from 'node:fs';
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

const timeoutMs = 15000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function findBrowser(explicit) {
  const candidates = explicit ? [resolve(explicit)] : [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    ...[process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA]
      .filter(Boolean).flatMap(root => [
        join(root, 'Google/Chrome/Application/chrome.exe'),
        join(root, 'Microsoft/Edge/Application/msedge.exe'),
      ]),
    ...(process.env.PATH || '').split(delimiter).filter(Boolean).flatMap(root =>
      ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge']
        .map(name => join(root, name))),
  ];
  for (const path of candidates) {
    try { await access(path, constants.X_OK); return path; } catch { /* 尝试下一个已安装位置。 */ }
  }
  throw new Error('未找到浏览器。请安装 Chrome/Chromium/Edge，或用 --browser 指定可执行文件。');
}

function within(promise, label) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label}超时`)), timeoutMs); }),
  ]).finally(() => clearTimeout(timer));
}

async function connect(endpoint, onEvent) {
  const socket = new WebSocket(endpoint);
  try {
    await within(new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', () => reject(new Error('无法连接浏览器调试接口')), { once: true });
    }), '连接浏览器');
  } catch (error) { socket.close(); throw error; }
  let sequence = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const task = pending.get(message.id);
      if (!task) return;
      pending.delete(message.id);
      if (message.error) task.reject(new Error(message.error.message));
      else task.resolve(message.result);
    } else onEvent(message);
  });
  socket.addEventListener('close', () => {
    for (const task of pending.values()) task.reject(new Error('浏览器连接已关闭'));
    pending.clear();
  });
  return {
    socket,
    send(method, params = {}, sessionId) {
      const id = ++sequence;
      return within(new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
      }), method).finally(() => pending.delete(id));
    },
  };
}

async function inspectPage() {
  await document.fonts.ready;
  await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  document.getAnimations().forEach(animation => animation.pause());
  const roots = document.querySelectorAll('#diagram');
  if (roots.length !== 1) throw new Error('页面必须恰好包含一个 #diagram');
  const root = roots[0];
  const box = root.getBoundingClientRect();
  const errors = [];
  const style = root.dataset.style;
  if (!['blueprint', 'chalkboard'].includes(style)) errors.push('data-style 只支持 blueprint 或 chalkboard');
  if (box.width < 1 || box.height < 1) errors.push('画布宽高必须大于 0');
  if (!(root.textContent || '').trim()) errors.push('画布内容为空');
  if (getComputedStyle(root).display === 'none' || getComputedStyle(root).visibility === 'hidden') errors.push('画布不可见');
  const outside = (child, parent) => child.left < parent.left - 1 || child.top < parent.top - 1 ||
    child.right > parent.right + 1 || child.bottom > parent.bottom + 1;
  const visible = element => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== 'hidden';
  };
  for (const element of root.querySelectorAll('svg text, [data-node-box], [data-check]')) {
    if (visible(element) && outside(element.getBoundingClientRect(), box)) {
      errors.push(`元素超出画布：${(element.textContent || element.tagName).trim().slice(0, 60)}`);
    }
  }
  for (const node of root.querySelectorAll('[data-node]')) {
    const shape = node.querySelector('[data-node-box]');
    if (!shape) { errors.push('data-node 缺少 data-node-box'); continue; }
    for (const text of node.querySelectorAll('text')) {
      if (visible(text) && outside(text.getBoundingClientRect(), shape.getBoundingClientRect())) {
        errors.push(`节点文字超框：${text.textContent.trim().slice(0, 60)}`);
      }
    }
  }
  if (root.scrollWidth > root.clientWidth + 1 || root.scrollHeight > root.clientHeight + 1) errors.push('画布存在内容溢出');
  for (const image of root.querySelectorAll('img')) {
    if (!image.complete || !image.naturalWidth) errors.push('存在未加载的图片');
  }
  return {
    style, width: box.width, height: box.height,
    clip: { x: box.x + scrollX, y: box.y + scrollY, width: box.width, height: box.height },
    errors,
  };
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      check: { type: 'boolean' }, output: { type: 'string' }, scale: { type: 'string', default: '2' },
      browser: { type: 'string' }, help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) {
    console.log('用法：node render.mjs <图解.html> [--check | --output 图解.png] [--scale 1..4] [--browser 路径]\n不带 --output 时仅检查；PNG 输出路径必须尚不存在。');
    return;
  }
  if (positionals.length !== 1) throw new Error('请指定一个本地 HTML 文件；用 --help 查看用法。');
  if (values.check && values.output) throw new Error('--check 与 --output 互斥');
  const scale = Number(values.scale);
  if (!Number.isFinite(scale) || scale < 1 || scale > 4) throw new Error('--scale 必须在 1 到 4 之间');
  if (typeof WebSocket !== 'function') throw new Error('需要 Node.js 22.4 或更新版本');
  const input = resolve(positionals[0]);
  await access(input, constants.R_OK);
  const output = values.output ? resolve(values.output) : null;
  if (output) {
    if (!output.toLowerCase().endsWith('.png')) throw new Error('输出文件必须以 .png 结尾');
    try { await access(output); throw new Error('输出文件已存在，请选择新文件名'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const browser = await findBrowser(values.browser);
  const profile = await mkdtemp(join(tmpdir(), 'draw-diagram-'));
  let child;
  let client;
  let exited = false;
  try {
    child = spawn(browser, [
      '--headless', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1',
      `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
      '--disable-background-networking', '--disable-extensions', '--hide-scrollbars', 'about:blank',
    ], { stdio: ['ignore', 'ignore', 'pipe'] });
    child.once('exit', () => { exited = true; });
    const endpoint = await within(new Promise((resolve, reject) => {
      let log = '';
      child.stderr.on('data', chunk => {
        log = (log + chunk).slice(-8000);
        const match = log.match(/DevTools listening on (ws:\/\/[^\s]+)/);
        if (match) resolve(match[1]);
      });
      child.once('error', reject);
      child.once('exit', code => reject(new Error(`浏览器提前退出（${code}）：${log.slice(-1000)}`)));
    }), '启动浏览器');
    const runtimeErrors = [];
    let loaded;
    client = await connect(endpoint, message => {
      if (message.method === 'Page.loadEventFired') loaded?.();
      if (message.method === 'Runtime.exceptionThrown') {
        const detail = message.params.exceptionDetails;
        runtimeErrors.push(detail.exception?.description || detail.text);
      }
      if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') runtimeErrors.push(message.params.entry.text);
      if (message.method === 'Network.requestWillBeSent' && /^https?:/.test(message.params.request.url)) runtimeErrors.push('HTML 请求了外部网络资源');
    });
    const { targetId } = await client.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await client.send('Target.attachToTarget', { targetId, flatten: true });
    const send = (method, params) => client.send(method, params, sessionId);
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Log.enable');
    await send('Network.enable');
    await send('Network.setBlockedURLs', { urls: ['http://*', 'https://*'] });
    await send('Emulation.setDeviceMetricsOverride', { width: 1800, height: 1100, deviceScaleFactor: 1, mobile: false });
    const ready = new Promise(resolve => { loaded = resolve; });
    const navigation = await send('Page.navigate', { url: pathToFileURL(input).href });
    if (navigation.errorText) throw new Error(navigation.errorText);
    await within(ready, '加载 HTML');
    const evaluation = await send('Runtime.evaluate', {
      expression: `(${inspectPage.toString()})()`, awaitPromise: true, returnByValue: true,
    });
    if (evaluation.exceptionDetails) throw new Error(evaluation.exceptionDetails.exception?.description || evaluation.exceptionDetails.text);
    const report = evaluation.result.value;
    const errors = [...new Set([...report.errors, ...runtimeErrors])];
    if (errors.length) throw new Error(`检查未通过：\n${errors.join('\n')}`);
    const result = { ok: true, input, style: report.style, width: report.width, height: report.height };
    if (output) {
      const capture = await send('Page.captureScreenshot', {
        format: 'png', captureBeyondViewport: true, clip: { ...report.clip, scale },
      });
      const png = Buffer.from(capture.data, 'base64');
      if (png.length < 24 || png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('浏览器未返回有效 PNG');
      const pixelWidth = png.readUInt32BE(16);
      const pixelHeight = png.readUInt32BE(20);
      if (Math.abs(pixelWidth - report.width * scale) > 1 || Math.abs(pixelHeight - report.height * scale) > 1) throw new Error('PNG 尺寸与画布不一致');
      await mkdir(dirname(output), { recursive: true });
      await writeFile(output, png, { flag: 'wx' });
      Object.assign(result, { output, scale, pixelWidth, pixelHeight });
    }
    console.log(JSON.stringify(result, null, 2));
  } finally {
    client?.socket.close();
    if (child && !exited && child.pid) {
      child.kill('SIGTERM');
      for (let i = 0; i < 20 && !exited; i++) await delay(100);
      if (!exited) { child.kill('SIGKILL'); await delay(200); }
    }
    await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
}

main().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exitCode = 1;
});
