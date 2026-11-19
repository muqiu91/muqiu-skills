# HTML 与导出约定

## HTML 结构

采用 `assets/template.html` 的单文件形式，使用 UTF-8 与 `lang="zh-CN"`。`#diagram` 是唯一截图区域，`data-style="blueprint"` 或 `data-style="chalkboard"` 设置在该根节点上。

根节点用明确的 CSS 像素宽高定义画布，内联 SVG 的 `viewBox` 与之相同。模板在小屏幕上允许滚动查看，保持导出时坐标稳定；不要通过浏览器缩放或 CSS `transform: scale()` 调整画布。

对于 SVG 节点，用 `<g data-node>` 包含形体和文字，在作为文字边界的主形体上加 `data-node-box`。导出器会检查文字是否位于这个形体内。分组标题、连线标签放在该组外。需要检查画布裁切的其他 HTML 元素可加 `data-check`。

所有资源内联，字体采用本地回退栈，不加载 CDN、远程字体、远程图片或外部脚本。模板的 CSP 会阻止网络资源；绘图不需要页面脚本。确需脚本时仍须保持离线、确定性，并等待布局稳定。使用 CSS 变量管理颜色，但不要求固定图形、固定节点数量或固定布局。

## 运行环境与命令

脚本使用 Node.js 内置 `fetch`、`WebSocket` 和 Chrome DevTools Protocol，保持浏览器默认沙箱，不访问用户的日常浏览器配置。要求 Node.js 22.4+ 和可执行的 Chrome、Chromium 或 Edge。浏览器通过本机常见位置或 `PATH` 发现，也可明确指定：

```bash
node "{baseDir}/scripts/render.mjs" "图解.html" --check --browser "/浏览器/可执行文件"
node "{baseDir}/scripts/render.mjs" "图解.html" --output "图解.jpg" --scale 2
# 用户要求 PNG 或无损图像时
node "{baseDir}/scripts/render.mjs" "图解.html" --output "图解.png" --scale 2
```

- 不带 `--output` 时仅检查；`--check` 明确指定仅检查，与 `--output` 互斥。
- 按 `--output` 的扩展名选择编码：`.jpg` / `.jpeg` 为 JPEG，固定质量 90；`.png` 为无损 PNG。默认交付 JPEG，PNG 按用户需求导出。浏览器直接编码，无需先保存 PNG 再转换。
- `--scale` 范围为 1–4，默认 2。它改变图像像素密度，不改变 HTML 布局。
- 输出路径需尚不存在，避免覆盖已有稿件；需要修订时选择新文件名。
- `--browser` 指向可执行文件本身；macOS 应用内部通常为 `Contents/MacOS/Google Chrome`。
- 输出为 JSON，包含画布大小、检查状态，以及导出时的格式、实际像素尺寸、文件字节数和 JPEG 质量。失败返回非零退出码。

JPEG 画布使用明确的实色背景；无损需求使用 PNG。HTML 预览确认流程对两种格式都适用。导出后实际查看文字边缘与小字，比较文件大小；质量 90 不表示文件大小固定，不要为达到任意体积阈值而自动缩小文字或分辨率。

## 检查边界

导出器会打开本地 HTML，等待字体、图片和两次绘制，暂停 CSS 动画，阻止 HTTP/HTTPS 请求，检查运行时错误、破损图片、内容为空、画布大小、正文越界及节点文字超框。截图只截取 `#diagram`，不截取外围工具栏或页面留白。

这些检查不能证明箭头含义正确、节点之间没有互相覆盖、字体没有缺字、配色好看或文字足够易读。必须实际查看浏览器预览或临时截图；确认后导出的 JPEG 或 PNG 也要查看。

浏览器启动与协议调用有超时，失败会退出并清理本次临时配置。缺少运行环境时先交付 HTML 并报告缺失项，不自动安装浏览器或依赖。

维护导出器时运行 `node "{baseDir}/scripts/render.test.mjs"`，使用真实浏览器验证仅检查、两种风格的高质量 JPEG、按需 PNG、中文路径、2 倍分辨率、裁切、错误拦截和已有文件保护。
