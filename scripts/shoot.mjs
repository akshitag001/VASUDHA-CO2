// Usage: node shoot.mjs <url> <outPrefix> <width> <height> <mobile 0|1> <scrollY,...>
import { spawn } from 'node:child_process'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const [url, out, W, H, mobile, stops] = process.argv.slice(2)
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const port = 9300 + Math.floor(Math.random() * 500)
const prof = mkdtempSync(join(tmpdir(), 'cdp-'))
const proc = spawn(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let target
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200)
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json()
    target = list.find((t) => t.type === 'page')
  } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r))
let id = 0
const pending = new Map()
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m)
    pending.delete(m.id)
  }
})
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
const evalJs = async (expr) => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: +W, height: +H, deviceScaleFactor: 1, mobile: mobile === '1' })
if (mobile === '1') await send('Emulation.setTouchEmulationEnabled', { enabled: true })
await send('Page.navigate', { url })
await sleep(1500)
await evalJs(`sessionStorage.setItem('vasudha.loaded','1')`)
await send('Page.reload')
await sleep(2500)
const info = await evalJs(`JSON.stringify({ docH: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth, vw: innerWidth })`)
console.log(info)
for (const s of stops.split(',')) {
  const y = s.endsWith('%') ? `Math.round((document.documentElement.scrollHeight - innerHeight) * ${parseFloat(s) / 100})` : s
  await evalJs(`window.scrollTo(0, ${y})`)
  await sleep(1300)
  const shot = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(`${out}-${s.replace('%', 'p')}.png`, Buffer.from(shot.result.data, 'base64'))
}
ws.close()
proc.kill()
process.exit(0)
