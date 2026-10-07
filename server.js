// Jednoduchy herni server: servíruje hru (public/index.html) a prenasi stav hracu pres WebSocket.
const http = require('http'), fs = require('fs'), path = require('path');
const { WebSocketServer } = require('ws');
const PORT = process.env.PORT || 3000, MAX_CLIENTS = 24, PUB = path.join(__dirname, 'public');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon' };

const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/healthz') { res.writeHead(200); return res.end('ok'); }
  let f = url === '/' ? '/index.html' : url;
  const fp = path.join(PUB, path.normalize(f));
  if (!fp.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  fs.readFile(fp, (e, d) => {
    if (e) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(d);
  });
});

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 8192 });
const clients = new Map(); // ws -> { id, presence, tokens, last, alive }
let counter = 0;
const KEY = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;
const send = (ws, o) => { if (ws.readyState === 1) ws.send(JSON.stringify(o)); };
const broadcast = (o, except) => { const s = JSON.stringify(o); for (const ws of clients.keys()) if (ws !== except && ws.readyState === 1) ws.send(s); };

wss.on('connection', (ws) => {
  if (clients.size >= MAX_CLIENTS) { ws.close(1013, 'plno'); return; }
  const id = 'p' + String(++counter).padStart(6, '0');
  const c = { id, presence: {}, tokens: 120, last: Date.now(), alive: true };
  clients.set(ws, c);
  send(ws, { t: 'hello', id, peers: [...clients.values()].filter(x => x.id !== id).map(x => [x.id, x.presence]) });
  ws.on('pong', () => { c.alive = true; });
  ws.on('message', (data) => {
    const now = Date.now();
    c.tokens = Math.min(120, c.tokens + (now - c.last) / 1000 * 60); c.last = now;
    if (c.tokens < 1) return; c.tokens--;
    let m; try { m = JSON.parse(data.toString()); } catch (_) { return; }
    if (!m || m.t !== 'p' || !m.p || typeof m.p !== 'object' || Array.isArray(m.p)) return;
    const next = Object.assign({}, c.presence);
    for (const k of Object.keys(m.p)) { if (!KEY.test(k)) continue; if (m.p[k] === null) delete next[k]; else next[k] = m.p[k]; }
    if (JSON.stringify(next).length > 4096) return;
    c.presence = next;
    broadcast({ t: 'u', id, p: next }, ws);
  });
  ws.on('close', () => { clients.delete(ws); broadcast({ t: 'l', id }); });
  ws.on('error', () => {});
});

setInterval(() => { for (const [ws, c] of clients) { if (!c.alive) { ws.terminate(); continue; } c.alive = false; try { ws.ping(); } catch (_) {} } }, 25000);
server.listen(PORT, () => console.log('Arena server bezi na portu ' + PORT));
