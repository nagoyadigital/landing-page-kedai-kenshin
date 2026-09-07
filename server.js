/**
 * server.js — Dev server lokal untuk Kedai Kenshin
 * Meniru perilaku PHP: auth, load, save, dan static files.
 *
 * Cara pakai:
 *   node server.js
 * lalu buka http://localhost:8000
 *
 * Hapus file ini sebelum deploy ke VPS (tidak dibutuhkan di sana).
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const PORT = 8000;
const ROOT = __dirname;

// ── Session store (persistent, disimpan ke data/_sessions.json) ──
const SESSION_FILE = path.join(__dirname, 'data', '_sessions.json');
function makeId() { return Math.random().toString(36).slice(2) + Date.now(); }
function loadSessions() {
  try { return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8')); }
  catch { return {}; }
}
function saveSessions(s) {
  try { fs.writeFileSync(SESSION_FILE, JSON.stringify(s)); } catch {}
}
function getSession(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const sid  = cookies['kenshin_sid'];
  if (!sid) return null;
  const all  = loadSessions();
  const sess = all[sid];
  // expire setelah 7 hari
  if (sess && (Date.now() - sess.time) < 7 * 24 * 3600 * 1000) return sess;
  return null;
}
function parseCookies(str) {
  return Object.fromEntries(str.split(';').map(c => {
    const [k, ...v] = c.trim().split('=');
    return [k, decodeURIComponent(v.join('='))];
  }).filter(([k]) => k));
}

// ── Baca kredensial admin dari auth.php ───────────────────
function getAdminCreds() {
  try {
    const src = fs.readFileSync(path.join(ROOT, 'admin', 'auth.php'), 'utf8');
    const u = (src.match(/ADMIN_USERNAME',\s*'([^']+)'/) || [])[1] || 'admin';
    const p = (src.match(/ADMIN_PASSWORD',\s*'([^']+)'/) || [])[1] || 'kenshin2024';
    return { username: u, password: p };
  } catch { return { username: 'admin', password: 'kenshin2024' }; }
}

// ── Data dir ──────────────────────────────────────────────
const DATA = path.join(ROOT, 'data');
function readJSON(file, def) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8')); }
  catch { return def; }
}
function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA, file), JSON.stringify(data, null, 2));
}

// ── MIME types ────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml',
  '.ttf':  'font/ttf',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

// ── Body reader (JSON) ────────────────────────────────────
function readBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

// ── Multipart parser (built-in, tanpa dependency) ─────────
// Parse multipart/form-data — returns { fields:{}, files:{name,data,ext} }
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const ct = req.headers['content-type'] || '';
    const m  = ct.match(/boundary=(.+)$/);
    if (!m) return reject(new Error('No boundary'));
    const boundary = '--' + m[1];

    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const buf    = Buffer.concat(chunks);
      const fields = {};
      const files  = {};

      // Split by boundary
      const bBuf = Buffer.from('\r\n' + boundary);
      let   pos  = buf.indexOf(boundary);
      while (pos !== -1) {
        const start = pos + Buffer.byteLength(boundary);
        // Check for final boundary (--)
        if (buf.slice(start, start + 2).toString() === '--') break;
        // Skip \r\n after boundary
        const headEnd = buf.indexOf('\r\n\r\n', start);
        if (headEnd === -1) break;
        const headers = buf.slice(start + 2, headEnd).toString();
        const nextBoundary = buf.indexOf('\r\n' + boundary, headEnd + 4);
        const bodyBuf = buf.slice(headEnd + 4, nextBoundary === -1 ? buf.length : nextBoundary);

        const nameMatch = headers.match(/name="([^"]+)"/);
        const fileMatch = headers.match(/filename="([^"]+)"/);
        if (nameMatch) {
          const name = nameMatch[1];
          if (fileMatch) {
            const filename = fileMatch[1];
            const ext = path.extname(filename).toLowerCase();
            files[name] = { filename, data: bodyBuf, ext };
          } else {
            fields[name] = bodyBuf.toString();
          }
        }
        pos = nextBoundary === -1 ? -1 : nextBoundary + 2;
      }
      resolve({ fields, files });
    });
    req.on('error', reject);
  });
}

// ── JSON responder ────────────────────────────────────────
function json(res, code, data, sid) {
  const headers = { 'Content-Type': 'application/json' };
  if (sid) headers['Set-Cookie'] = `kenshin_sid=${sid}; Path=/; HttpOnly`;
  res.writeHead(code, headers);
  res.end(JSON.stringify(data));
}

// ── Allowed image types ───────────────────────────────────
const ALLOWED_IMG = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const IMG_DIR     = path.join(ROOT, 'images', 'menu');

// ═══════════════════════════════════════
//  HTTP SERVER
// ═══════════════════════════════════════
const server = http.createServer(async (req, res) => {
  const url    = new URL(req.url, `http://localhost:${PORT}`);
  const method = req.method.toUpperCase();
  let   p      = url.pathname;

  // ── API: admin/auth.php ────────────────────────────────
  if (p === '/admin/auth.php' && method === 'POST') {
    const body  = await readBody(req);
    const creds = getAdminCreds();

    if (body.action === 'login') {
      if (body.username === creds.username && body.password === creds.password) {
        const sid      = makeId();
        const sessions = loadSessions();
        sessions[sid]  = { user: body.username, time: Date.now() };
        saveSessions(sessions);
        return json(res, 200, { success: true, message: 'Login berhasil' }, sid);
      }
      return json(res, 401, { success: false, message: 'Username atau password salah' });
    }

    if (body.action === 'logout') {
      const cookies = parseCookies(req.headers.cookie || '');
      const sid     = cookies['kenshin_sid'];
      if (sid) {
        const sessions = loadSessions();
        delete sessions[sid];
        saveSessions(sessions);
      }
      return json(res, 200, { success: true, message: 'Logout berhasil' });
    }

    if (body.action === 'check') {
      const sess = getSession(req);
      return json(res, 200, { logged_in: !!sess });
    }

    return json(res, 400, { success: false, message: 'Action tidak dikenal' });
  }

  // ── API: api/load.php ──────────────────────────────────
  // Dev mirror: normalisasi 'r2:...' ke URL publik bila R2_PUBLIC_BASE_URL di-set.
  if (p === '/api/load.php' && method === 'GET') {
    const settings       = readJSON('settings.json', { wa_number: '', alamat: '', status_buka: true });
    const menu_overrides = readJSON('menu_overrides.json', {});
    const custom_kategori = settings.custom_kategori || [];
    const r2base = (process.env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    if (r2base && menu_overrides && typeof menu_overrides === 'object') {
      Object.values(menu_overrides).forEach(ov => {
        if (ov && typeof ov.img === 'string' && ov.img.startsWith('r2:')) {
          ov.img = r2base + '/' + ov.img.slice(3).replace(/^\//, '');
        }
      });
    }
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify({ success: true, settings, menu_overrides, custom_kategori }));
  }

  // ── API: api/save.php ──────────────────────────────────
  if (p === '/api/save.php' && method === 'POST') {
    if (!getSession(req)) return json(res, 401, { success: false, message: 'Unauthorized' });

    const body = await readBody(req);

    if (body.type === 'settings') {
      const allowed  = ['wa_number', 'alamat', 'status_buka'];
      const existing = readJSON('settings.json', {});
      allowed.forEach(k => { if (body.data?.[k] !== undefined) existing[k] = body.data[k]; });
      if (existing.wa_number && !/^\d{10,15}$/.test(existing.wa_number))
        return json(res, 200, { success: false, message: 'Format nomor WA tidak valid' });
      writeJSON('settings.json', existing);
      return json(res, 200, { success: true, message: 'Settings berhasil disimpan' });
    }

    if (body.type === 'menu') {
      if (!body.data) return json(res, 400, { success: false, message: 'Data menu tidak valid' });
      const existing = readJSON('menu_overrides.json', {});
      Object.entries(body.data).forEach(([id, ov]) => {
        const key = String(id);
        // Merge — jangan timpa field yang sudah ada (img, _isCustom, name, dll)
        if (!existing[key]) existing[key] = {};
        if (ov.harga  !== undefined && ov.harga  !== null) existing[key].harga  = parseInt(ov.harga);
        if (ov.status !== undefined && ov.status !== null) existing[key].status = String(ov.status);
        if (ov.img    !== undefined && ov.img    !== null) existing[key].img    = String(ov.img);
        if (ov.name   !== undefined && ov.name   !== null) existing[key].name   = String(ov.name);
        if (ov.desc   !== undefined && ov.desc   !== null) existing[key].desc   = String(ov.desc);
        if (ov.kategori !== undefined) existing[key].kategori = String(ov.kategori);
      });
      writeJSON('menu_overrides.json', existing);
      return json(res, 200, { success: true, message: 'Menu berhasil disimpan' });
    }

    return json(res, 400, { success: false, message: 'Tipe tidak dikenal' });
  }

  // ── API: api/upload-image ──────────────────────────────
  if ((p === '/api/upload-image' || p === '/api/upload-image.php') && method === 'POST') {
    if (!getSession(req)) return json(res, 401, { success: false, message: 'Unauthorized' });

    let parsed;
    try { parsed = await parseMultipart(req); }
    catch (e) { return json(res, 400, { success: false, message: 'Format upload tidak valid' }); }

    const menuId = parsed.fields['menu_id'];
    const file   = parsed.files['foto'];

    if (!menuId) return json(res, 400, { success: false, message: 'menu_id diperlukan' });
    if (!file)   return json(res, 400, { success: false, message: 'File foto tidak ditemukan' });

    if (!ALLOWED_IMG.has(file.ext))
      return json(res, 400, { success: false, message: 'Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.' });

    if (file.data.length > 5 * 1024 * 1024)
      return json(res, 400, { success: false, message: 'Ukuran file maksimal 5MB.' });

    // Pastikan folder images/menu/ ada
    if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

    // Nama file: menu-{id}-{timestamp}{ext}
    const filename = `menu-${menuId}-${Date.now()}${file.ext}`;
    const filepath = path.join(IMG_DIR, filename);
    fs.writeFileSync(filepath, file.data);

    // Simpan path ke menu_overrides.json
    const imgPath = `images/menu/${filename}`;
    const overrides = readJSON('menu_overrides.json', {});
    if (!overrides[String(menuId)]) overrides[String(menuId)] = {};
    overrides[String(menuId)].img = imgPath;
    writeJSON('menu_overrides.json', overrides);

    return json(res, 200, { success: true, img: imgPath, message: 'Foto berhasil diupload' });
  }

  // ── API: api/menu-action (tambah / edit / hapus menu) ─────────────────
  if ((p === '/api/menu-action' || p === '/api/menu-action.php') && method === 'POST') {
    if (!getSession(req)) return json(res, 401, { success: false, message: 'Unauthorized' });
    const body = await readBody(req);

    // ── TAMBAH menu baru ──────────────────────────────────
    if (body.action === 'add') {
      const { name, kategori, harga, desc, status } = body.data || {};
      if (!name || !kategori) return json(res, 400, { success: false, message: 'Nama dan kategori wajib diisi' });

      const overrides = readJSON('menu_overrides.json', {});
      // ID baru: ambil max existing ID + 1
      const existingIds = Object.keys(overrides)
        .map(k => parseInt(k)).filter(n => !isNaN(n));
      // Mulai dari 1000 untuk menu custom agar tidak pernah bentrok dengan ID statis
      const customMax = existingIds.filter(n => n >= 1000);
      const newId = String(Math.max(999, ...customMax) + 1);

      overrides[newId] = {
        _isCustom: true,
        name:      String(name).trim(),
        kategori:  String(kategori),
        harga:     parseInt(harga) || 0,
        desc:      String(desc || '').trim(),
        status:    status === 'habis' ? 'habis' : 'tersedia',
        img:       null,
      };
      writeJSON('menu_overrides.json', overrides);
      return json(res, 200, { success: true, id: newId, message: 'Menu berhasil ditambahkan' });
    }

    // ── EDIT menu ─────────────────────────────────────────
    if (body.action === 'edit') {
      const { id, name, kategori, harga, desc, status } = body.data || {};
      if (!id) return json(res, 400, { success: false, message: 'ID menu diperlukan' });

      const overrides = readJSON('menu_overrides.json', {});
      if (!overrides[String(id)]) overrides[String(id)] = {};
      const ov = overrides[String(id)];
      if (name     !== undefined) ov.name     = String(name).trim();
      if (kategori !== undefined) ov.kategori = String(kategori);
      if (harga    !== undefined) ov.harga    = parseInt(harga) || 0;
      if (desc     !== undefined) ov.desc     = String(desc).trim();
      if (status   !== undefined) ov.status   = status === 'habis' ? 'habis' : 'tersedia';
      writeJSON('menu_overrides.json', overrides);
      return json(res, 200, { success: true, message: 'Menu berhasil diupdate' });
    }

    // ── HAPUS menu ────────────────────────────────────────
    if (body.action === 'delete') {
      const { id } = body.data || {};
      if (!id) return json(res, 400, { success: false, message: 'ID menu diperlukan' });

      const overrides = readJSON('menu_overrides.json', {});
      if (overrides[String(id)]) {
        overrides[String(id)]._deleted = true;
        writeJSON('menu_overrides.json', overrides);
      }
      return json(res, 200, { success: true, message: 'Menu berhasil dihapus' });
    }

    return json(res, 400, { success: false, message: 'Action tidak dikenal' });
  }

  // ── API: api/kategori-action (tambah / hapus kategori) ────────────────
  if ((p === '/api/kategori-action' || p === '/api/kategori-action.php') && method === 'POST') {
    if (!getSession(req)) return json(res, 401, { success: false, message: 'Unauthorized' });
    const body = await readBody(req);

    const settings = readJSON('settings.json', {});
    if (!settings.custom_kategori) settings.custom_kategori = [];

    if (body.action === 'add') {
      const { id, name, jp, icon } = body.data || {};
      if (!id || !name) return json(res, 400, { success: false, message: 'ID dan nama kategori wajib diisi' });
      const exists = settings.custom_kategori.find(k => k.id === id);
      if (exists) return json(res, 400, { success: false, message: 'ID kategori sudah ada' });
      settings.custom_kategori.push({
        id: String(id).toLowerCase().replace(/\s+/g, '-'),
        name: String(name).trim(),
        jp:   String(jp || '').trim(),
        icon: String(icon || '🍽️'),
      });
      writeJSON('settings.json', settings);
      return json(res, 200, { success: true, message: 'Kategori berhasil ditambahkan' });
    }

    if (body.action === 'delete') {
      const { id } = body.data || {};
      settings.custom_kategori = settings.custom_kategori.filter(k => k.id !== id);
      writeJSON('settings.json', settings);
      return json(res, 200, { success: true, message: 'Kategori berhasil dihapus' });
    }

    if (body.action === 'edit') {
      const { id, name, icon, jp } = body.data || {};
      if (!id || !name) return json(res, 400, { success: false, message: 'ID dan nama wajib diisi' });
      const kat = settings.custom_kategori.find(k => k.id === id);
      if (kat) {
        kat.name = String(name).trim();
        kat.icon = String(icon || '🍽️');
        kat.jp   = String(jp || '').trim();
      }
      writeJSON('settings.json', settings);
      return json(res, 200, { success: true, message: 'Kategori berhasil diupdate' });
    }

    return json(res, 400, { success: false, message: 'Action tidak dikenal' });
  }

  // ── API: api/load.php (tambah custom_kategori & custom_menu) ──────────
  // (sudah ditangani di atas, tapi kita perlu update load agar sertakan kategori custom)

  // ── Static files ───────────────────────────────────────
  // /admin/ → admin/index.html
  // /       → index.html
  if (p.endsWith('/')) p += 'index.html';

  const filePath = path.join(ROOT, p);

  // Keamanan: jangan keluar dari ROOT
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      return res.end(`<h2>404 – File tidak ditemukan</h2><p>${p}</p>`);
    }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ┌─────────────────────────────────────────────┐');
  console.log('  │  🍜  Kedai Kenshin — Dev Server             │');
  console.log('  ├─────────────────────────────────────────────┤');
  console.log(`  │  🌐 Website  →  http://localhost:${PORT}        │`);
  console.log(`  │  ⚙️  Admin    →  http://localhost:${PORT}/admin/ │`);
  console.log('  │                                             │');
  console.log('  │  Ctrl+C untuk stop                          │');
  console.log('  └─────────────────────────────────────────────┘');
  console.log('');
});
