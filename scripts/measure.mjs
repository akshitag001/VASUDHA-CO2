// Image-loading profiler: headless Chrome over CDP, throttled network, cold cache.
// Usage: node scripts/measure.mjs <url> <profile: fast4g|slow4g|none> <preloader: on|off> [width height]
// Prints when each image request starts/ends and when the hero image becomes visible.
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const [url, profile = 'fast4g', pre = 'on', W = '1440', H = '900'] = process.argv.slice(2)
const NET = {
  fast4g: { latency: 60, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 },
  slow4g: { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (0.75 * 1024 * 1024) / 8 },
  none: null,
}[profile]
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const port = 9300 + Math.floor(Math.random() * 500)
const proc = spawn(chrome, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'cdp-'))}`, 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let target
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200)
  try {
    target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page')
  } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r))
let id = 0
const pending = new Map()
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) (pending.get(m.id)(m), pending.delete(m.id))
})
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
const evalJs = async (expr) => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value

await send('Page.enable')
await send('Network.enable')
await send('Emulation.setDeviceMetricsOverride', { width: +W, height: +H, deviceScaleFactor: 1, mobile: +W < 600 })
// Visit once (uncached is irrelevant here) just to set the session flag if needed, then measure a cold load.
if (pre === 'off') {
  await send('Page.navigate', { url })
  await sleep(1200)
  await evalJs(`sessionStorage.setItem('vasudha.loaded','1')`)
}
await send('Network.setCacheDisabled', { cacheDisabled: true })
await send('Network.clearBrowserCache')
if (NET) await send('Network.emulateNetworkConditions', { offline: false, ...NET })
// Watch the hero image's real on-screen state from the very first script tick.
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `(() => { const t0 = performance.now(); window.__vis = null; window.__loaded = null;
    const tick = () => { const img = document.querySelector('.hero-art');
      if (img) { if (img.complete && img.naturalWidth && window.__loaded == null) window.__loaded = performance.now();
        const o = parseFloat(getComputedStyle(img).opacity); const r = img.getBoundingClientRect();
        const pre = document.querySelector('.preloader:not(.is-done)');
        if (window.__vis == null && img.complete && img.naturalWidth && o > 0.9 && !pre && r.top < innerHeight) window.__vis = performance.now(); }
      if (window.__vis == null) setTimeout(tick, 25) };
    setTimeout(tick, 0) })()`,
})
await send('Page.navigate', { url })
await sleep(NET?.latency === 150 ? 14000 : 7000)
const out = await evalJs(`JSON.stringify({
  fcp: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime,
  heroLoaded: window.__loaded, heroVisible: window.__vis,
  res: performance.getEntriesByType('resource').filter(r => /\\.(webp|jpg|png|woff2|css|js)(\\?|$)/.test(r.name) || r.initiatorType === 'css')
    .map(r => ({ n: r.name.replace(location.origin, '').split('/').pop().slice(0, 34), type: r.initiatorType, start: Math.round(r.startTime), end: Math.round(r.responseEnd), kb: Math.round((r.encodedBodySize || r.transferSize) / 1024) }))
})`)
const o = JSON.parse(out)
console.log(`\n== ${url}  net=${profile}  preloader=${pre}  ${W}x${H}`)
console.log(`FCP ${Math.round(o.fcp)} ms · hero image loaded ${Math.round(o.heroLoaded)} ms · hero VISIBLE ${o.heroVisible ? Math.round(o.heroVisible) + ' ms' : 'never (in window)'}`)
for (const r of o.res.sort((a, b) => a.start - b.start)) console.log(`  ${String(r.start).padStart(5)} → ${String(r.end).padStart(5)} ms  ${String(r.kb).padStart(4)} KB  ${r.type.padEnd(14)} ${r.n}`)
ws.close()
proc.kill()
process.exit(0)
