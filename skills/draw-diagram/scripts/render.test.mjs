// 端到端验证：使用真实浏览器，不访问网络或日常浏览器配置。
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { inflateSync } from 'node:zlib';

const scripts = dirname(fileURLToPath(import.meta.url));
const renderer = join(scripts, 'render.mjs');
const template = await readFile(join(scripts, '../assets/template.html'), 'utf8');

function run(input, ...args) {
  const result = spawnSync(process.execPath, [renderer, input, ...args], { encoding: 'utf8', timeout: 45000 });
  assert.ifError(result.error);
  return { ...result, json: JSON.parse(result.status === 0 ? result.stdout : result.stderr) };
}

async function isolated(task) {
  const dir = await mkdtemp(join(tmpdir(), 'draw-diagram-test-'));
  try { await task(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}

test('两种风格可以仅检查，检查不会创建图片', async () => isolated(async dir => {
  for (const style of ['blueprint', 'chalkboard']) {
    const input = join(dir, `${style}.html`);
    await writeFile(input, template.replace('id="diagram" data-style="blueprint"', `id="diagram" data-style="${style}"`));
    const result = run(input, '--check');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.json.style, style);
    assert.equal(result.json.width, 1600);
    assert.equal(result.json.height, 900);
  }
  assert.deepEqual((await readdir(dir)).sort(), ['blueprint.html', 'chalkboard.html']);
}));

test('两种风格直接导出高质量 JPEG，支持 jpg/jpeg，黑板颗粒图比 PNG 更小', async () => isolated(async dir => {
  for (const [style, extension] of [['blueprint', 'jpg'], ['chalkboard', 'JPEG']]) {
    const input = join(dir, `${style} 中文.html`);
    const output = join(dir, `${style} 中文.${extension}`);
    let source = template.replace('id="diagram" data-style="blueprint"', `id="diagram" data-style="${style}"`);
    if (style === 'chalkboard') {
      // 模拟实际粉笔黑板底纹：细颗粒使无损 PNG 体积增大。
      source = source.replace('</defs>', '<filter id="board-grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed="8"/></filter></defs>')
        .replace('<rect width="1600" height="900" fill="url(#grid)"/>', '<rect width="1600" height="900" filter="url(#board-grain)" opacity="0.025"/>');
    }
    await writeFile(input, source);
    const result = run(input, '--output', output);
    assert.equal(result.status, 0, result.stderr);
    const jpeg = await readFile(output);
    assert.equal(jpeg.subarray(0, 2).toString('hex'), 'ffd8');
    assert.equal(jpeg.subarray(-2).toString('hex'), 'ffd9');
    const frame = jpeg.indexOf(Buffer.from([0xff, 0xc0]));
    assert.ok(frame > 0, 'Chrome JPEG 应包含基线帧头');
    assert.equal(jpeg.readUInt16BE(frame + 7), 3200);
    assert.equal(jpeg.readUInt16BE(frame + 5), 1800);
    assert.ok(jpeg.length > 10000, '中文图解不应是空白图');
    assert.equal(result.json.format, 'jpeg');
    assert.equal(result.json.quality, 90);
    assert.equal(result.json.pixelWidth, 3200);
    assert.equal(result.json.pixelHeight, 1800);
    assert.equal(result.json.bytes, jpeg.length);
    assert.ok(!(await readdir(dir)).some(name => name.endsWith('.png')), 'JPEG 导出不应生成中间 PNG');
    if (style === 'chalkboard') {
      const pngPath = join(dir, 'requested.png');
      const pngResult = run(input, '--output', pngPath);
      assert.equal(pngResult.status, 0, pngResult.stderr);
      const png = await readFile(pngPath);
      assert.ok(jpeg.length < png.length, '包含细颗粒的黑板图，JPEG 应比同尺寸 PNG 小');
    }
  }
}));

test('中文与空格路径可导出 2 倍 PNG，裁切准确且图像非空', async () => isolated(async dir => {
  const input = join(dir, '中文 图解.html');
  const output = join(dir, '中文 图解.png');
  // 根节点位于浏览器首屏以外；截图须裁切它，而不是默认视口。
  const source = template.replace('padding: 32px;', 'padding: 1200px 100px 40px;')
    .replace('<rect width="1600" height="900" fill="url(#grid)"/>', '');
  await writeFile(input, source);
  const result = run(input, '--output', output);
  assert.equal(result.status, 0, result.stderr);
  const png = await readFile(output);
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 3200);
  assert.equal(png.readUInt32BE(20), 1800);
  assert.ok(png.length > 10000, '中文图解不应是空白图');
  const chunks = [];
  for (let offset = 8; offset < png.length;) {
    const size = png.readUInt32BE(offset);
    if (png.toString('ascii', offset + 4, offset + 8) === 'IDAT') chunks.push(png.subarray(offset + 8, offset + 8 + size));
    offset += size + 12;
  }
  const pixels = inflateSync(Buffer.concat(chunks));
  // 第一行首像素位于画布纯色底，不能截到外围灰色页面。
  assert.ok([2, 6].includes(png[25]), '图像使用 RGB 或 RGBA 通道');
  // 第一行首像素的左、上邻居均为 0，五种 PNG 过滤器的预测值都是 0。
  assert.deepEqual([...pixels.subarray(1, 4)], [250, 248, 245]);
  assert.equal(result.json.pixelWidth, 3200);
  assert.equal(result.json.pixelHeight, 1800);
  assert.equal(result.json.format, 'png');
  assert.equal(result.json.quality, undefined);
}));

test('缺少根节点、画布为空、文字裁切、节点文字超框均阻止导出', async () => isolated(async dir => {
  const cases = [
    ['缺少根节点', '<!doctype html><p>只有正文</p>', /#diagram/],
    ['空白画布', '<!doctype html><main id="diagram" data-style="blueprint" style="width:600px;height:400px"></main>', /内容为空/],
    ['文字裁切', template.replace('x="80" y="151"', 'x="1580" y="151"'), /超出画布/],
    ['节点文字超框', template.replace('x="215" y="391"', 'x="400" y="391"'), /节点文字超框/],
  ];
  for (const [name, source, expected] of cases) {
    const input = join(dir, `${name}.html`);
    const output = join(dir, `${name}.jpg`);
    await writeFile(input, source);
    const result = run(input, '--output', output);
    assert.notEqual(result.status, 0, name);
    assert.match(result.json.error, expected);
    assert.ok(!(await readdir(dir)).includes(`${name}.jpg`));
  }
}));

test('外部资源请求会被阻止且不会生成 JPEG', async () => isolated(async dir => {
  const input = join(dir, 'external.html');
  const output = join(dir, 'external.jpg');
  const source = template.replace(/  <meta http-equiv="Content-Security-Policy"[^>]+>\n/, '')
    .replace('</main>', '<img src="https://example.invalid/image.png"></main>');
  await writeFile(input, source);
  const result = run(input, '--output', output);
  assert.notEqual(result.status, 0);
  assert.match(result.json.error, /外部网络资源|未加载的图片|ERR_BLOCKED/);
  assert.ok(!(await readdir(dir)).includes('external.jpg'));
}));

test('现有 JPEG/PNG 不被覆盖，参数错误与浏览器缺失有明确提示', async () => isolated(async dir => {
  const input = join(dir, 'source.html');
  const output = join(dir, 'existing.png');
  const jpegOutput = join(dir, 'existing.jpg');
  await writeFile(input, template);
  await writeFile(output, '保留原稿');
  await writeFile(jpegOutput, '保留 JPEG 原稿');
  for (const [args, expected] of [
    [['--output', output], /已存在/],
    [['--output', jpegOutput], /已存在/],
    [['--output', join(dir, 'unsupported.webp')], /\.jpg、\.jpeg 或 \.png/],
    [['--scale', '0'], /scale/],
    [['--browser', join(dir, 'missing-chrome')], /未找到浏览器/],
    [['--check', '--output', join(dir, 'new.png')], /互斥/],
  ]) {
    const result = run(input, ...args);
    assert.notEqual(result.status, 0);
    assert.match(result.json.error, expected);
  }
  assert.equal(await readFile(output, 'utf8'), '保留原稿');
  assert.equal(await readFile(jpegOutput, 'utf8'), '保留 JPEG 原稿');
}));
