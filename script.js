/* ============================================
   OKAYAMA KEDAI KENSHIN — Menu Script
   Data statis: menu-data.js (load sebelum file ini)
   Data dinamis: api/load.php (override + custom)
   ============================================ */

// ── STATE ──────────────────────────────────────────────────
let activeKategori = "semua";
let searchQuery    = "";
let selectedMenu   = null;
let WA_NUMBER      = "628xxxxxxxxxx";

// Salinan yang bisa dimodifikasi oleh override server
let liveMenuData     = menuData     ? menuData.map(m => ({...m}))     : [];
let liveKategoriData = kategoriData ? kategoriData.map(k => ({...k})) : [];

// ── FORMAT YEN ─────────────────────────────────────────────
function formatRupiah(angka) {
  return "¥" + Number(angka).toLocaleString("ja-JP");
}
// Harga dengan label 税抜 (belum termasuk pajak)
function formatHarga(angka) {
  return `<span class="price-amount">¥${Number(angka).toLocaleString("ja-JP")}</span><span class="price-zeinuki">税抜</span>`;
}

// ── FILTER MENU ────────────────────────────────────────────
function getFilteredMenu() {
  return liveMenuData.filter(item => {
    if (item._deleted) return false;
    const matchKat    = activeKategori === "semua" || item.kategori === activeKategori;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.desc || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchKat && matchSearch;
  });
}

function getKatCount(katId) {
  if (katId === "semua") return liveMenuData.filter(m => !m._deleted).length;
  return liveMenuData.filter(m => m.kategori === katId && !m._deleted).length;
}

// ── RENDER KATEGORI ────────────────────────────────────────
function renderKategori() {
  const grid = document.getElementById("kategoriGrid");
  if (!grid) return;
  grid.innerHTML = "";

  liveKategoriData.forEach(kat => {
    const count = getKatCount(kat.id);
    const card  = document.createElement("div");
    card.className = "kat-card" + (kat.id === activeKategori ? " active" : "");
    card.dataset.id = kat.id;
    card.innerHTML = `
      <div class="kat-icon">${kat.icon}</div>
      <div class="kat-info">
        <span class="kat-name">${kat.name}</span>
        <span class="kat-jp">${kat.jp || ""}</span>
        <span class="kat-count">${count} menu</span>
      </div>
    `;
    card.addEventListener("click", () => {
      activeKategori = kat.id;
      renderKategori();
      renderMenu();
    });
    grid.appendChild(card);
  });
}

// ── BUILD CARD ─────────────────────────────────────────────
function buildMenuCard(item, idx) {
  const card = document.createElement("div");
  card.className = "menu-card" + (item.status === "habis" ? " habis" : "");
  card.style.animationDelay = (idx * 0.04) + "s";

  const imgHtml = item.img
    ? `<img class="menu-img" src="${item.img}" alt="${item.name}" loading="lazy" decoding="async" fetchpriority="low"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
       <div class="menu-img-placeholder" style="display:none">${getCategoryIcon(item.kategori)}</div>`
    : `<div class="menu-img-placeholder">${getCategoryIcon(item.kategori)}</div>`;

  const badgeClass = item.status === "tersedia" ? "tersedia" : "habis";
  const badgeLabel = item.status === "tersedia" ? "● Tersedia" : "● Habis";

  card.innerHTML = `
    <div class="menu-img-wrap">
      ${imgHtml}
      <span class="badge-status ${badgeClass}">${badgeLabel}</span>
    </div>
    <div class="menu-body">
      <span class="menu-kategori-tag">${getKategoryName(item.kategori)}</span>
      <h3 class="menu-name">${item.name}</h3>
      <p class="menu-desc">${item.desc || ""}</p>
      <div class="menu-footer">
        <span class="menu-price">${formatHarga(item.harga)}</span>
      </div>
    </div>
  `;

  card.addEventListener("click", e => {
    if (!e.target.closest(".btn-order")) openModal(item);
  });

  return card;
}

// ── RENDER MENU ────────────────────────────────────────────
function renderMenu() {
  const grid       = document.getElementById("menuGrid");
  const emptyState = document.getElementById("emptyState");
  if (!grid) return;

  const filtered  = getFilteredMenu();
  const tersedia  = liveMenuData.filter(m => !m._deleted && m.status === "tersedia").length;
  const habis     = liveMenuData.filter(m => !m._deleted && m.status === "habis").length;

  const elAvail = document.getElementById("count-available");
  const elHabis = document.getElementById("count-habis");
  const elTotal = document.getElementById("count-total");
  if (elAvail) elAvail.textContent = tersedia;
  if (elHabis) elHabis.textContent = habis;
  if (elTotal) elTotal.textContent = liveMenuData.filter(m => !m._deleted).length;

  grid.innerHTML = "";

  if (filtered.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    return;
  }
  if (emptyState) emptyState.style.display = "none";

  if (activeKategori === "semua" && searchQuery === "") {
    grid.classList.remove("flat");
    const orderedKats = liveKategoriData.filter(k => k.id !== "semua");
    orderedKats.forEach(kat => {
      const items = filtered.filter(m => m.kategori === kat.id);
      if (!items.length) return;
      const heading = document.createElement("div");
      heading.className = "kat-group-heading";
      heading.innerHTML = `
        <span class="kat-group-icon">${kat.icon}</span>
        <div class="kat-group-text">
          <span class="kat-group-name">${kat.name}</span>
          <span class="kat-group-jp">${kat.jp || ""}</span>
        </div>
        <span class="kat-group-count">${items.length} menu</span>
      `;
      grid.appendChild(heading);
      const subGrid = document.createElement("div");
      subGrid.className = "menu-subgrid";
      items.forEach((item, idx) => subGrid.appendChild(buildMenuCard(item, idx)));
      grid.appendChild(subGrid);
    });
  } else {
    grid.classList.add("flat");
    filtered.forEach((item, idx) => grid.appendChild(buildMenuCard(item, idx)));
  }
}

// ── HELPERS ────────────────────────────────────────────────
function getCategoryIcon(katId) {
  const kat = liveKategoriData.find(k => k.id === katId);
  return kat ? kat.icon : "🍽️";
}
function getKategoryName(katId) {
  const kat = liveKategoriData.find(k => k.id === katId);
  return kat ? kat.name : katId;
}

// ── MODAL DETAIL ───────────────────────────────────────────
function openModal(item) {
  selectedMenu = item;
  const overlay = document.getElementById("modalOverlay");
  if (!overlay) return;

  const imgHtml = item.img
    ? `<img class="modal-img" src="${item.img}" alt="${item.name}" loading="lazy" decoding="async"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
       <div class="modal-img-placeholder" style="display:none">${getCategoryIcon(item.kategori)}</div>`
    : `<div class="modal-img-placeholder">${getCategoryIcon(item.kategori)}</div>`;

  document.getElementById("modalContent").innerHTML = `
    <div class="modal-img-wrap">${imgHtml}</div>
    <div class="modal-body">
      <p class="modal-kat">${getKategoryName(item.kategori)}</p>
      <h2 class="modal-name">${item.name}</h2>
      <p class="modal-desc">${item.desc || ""}</p>
      <p class="modal-price">${formatHarga(item.harga)}</p>
      <div class="modal-actions">
        <button class="btn-close-modal" id="btnCloseModal">Tutup</button>
      </div>
    </div>
  `;

  overlay.classList.add("open");
  document.getElementById("btnCloseModal")?.addEventListener("click", closeModal);
}

function closeModal() {
  document.getElementById("modalOverlay")?.classList.remove("open");
  selectedMenu = null;
}

// ── ORDER WHATSAPP ─────────────────────────────────────────
function orderWhatsApp(item) {
  const msg = encodeURIComponent(
    `Halo Kedai Kenshin! Saya ingin memesan:\n\n` +
    `📦 *${item.name}*\n💰 ${formatRupiah(item.harga)}\n\nMohon konfirmasinya, terima kasih! 🙏`
  );
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
}

// ── JAM OPERASIONAL (JST / UTC+9) ──────────────────────────
// Selasa–Sabtu: 12.00–00.00 | Minggu: 12.00–21.00 | Senin: 17.00–22.00
const JAM_BUKA = {
  0: null,              // Minggu: override di bawah
  1: [17 * 60, 22 * 60], // Senin: 17:00–22:00
  2: [12 * 60, 24 * 60], // Selasa: 12:00–24:00
  3: [12 * 60, 24 * 60], // Rabu
  4: [12 * 60, 24 * 60], // Kamis
  5: [12 * 60, 24 * 60], // Jumat
  6: [12 * 60, 24 * 60], // Sabtu: 12:00–24:00
};
const JAM_BUKA_MINGGU = [12 * 60, 21 * 60]; // Minggu: 12:00–21:00

function isKedaiBuka() {
  // Waktu saat ini dalam JST (UTC+9)
  const now   = new Date();
  const utc   = now.getTime() + now.getTimezoneOffset() * 60000;
  const jst   = new Date(utc + 9 * 3600000);
  const day   = jst.getDay();   // 0=Minggu, 1=Senin, ...
  const menit = jst.getHours() * 60 + jst.getMinutes();

  const range = day === 0 ? JAM_BUKA_MINGGU : JAM_BUKA[day];
  if (!range) return false;
  return menit >= range[0] && menit < range[1];
}

function updateBadgeStatus(manualOverride) {
  const badge = document.querySelector(".badge-open");
  if (!badge) return;

  // Manual override dari admin (settings.json) selalu menang
  if (manualOverride === false) {
    badge.textContent = "● Tutup";
    badge.style.background = "var(--red, #DC2626)";
    return;
  }

  // Otomatis berdasarkan jam JST
  const buka = isKedaiBuka();
  badge.textContent = buka ? "● Buka Sekarang" : "● Tutup";
  badge.style.background = buka
    ? "var(--primary, #7B1515)"
    : "var(--red, #DC2626)";
}

// Update badge setiap menit
setInterval(() => updateBadgeStatus(), 60000);
async function loadFromAPI() {
  try {
    const res  = await fetch("api/load.php");
    if (!res.ok) return;
    const data = await res.json();
    if (!data.success) return;

    // Settings
    if (data.settings?.wa_number) WA_NUMBER = data.settings.wa_number;
    const el = document.getElementById("footerAlamat");
    if (el && data.settings?.alamat) el.textContent = data.settings.alamat;

    // Badge status — manual override jika admin set false, otherwise otomatis
    const manualOverride = data.settings?.status_buka;
    updateBadgeStatus(manualOverride);

    // Kategori custom — tambahkan ke liveKategoriData
    if (data.custom_kategori?.length) {
      data.custom_kategori.forEach(ck => {
        if (!liveKategoriData.find(k => k.id === ck.id)) {
          liveKategoriData.push(ck);
        }
      });
    }

    // Override & custom menu
    if (data.menu_overrides) {
      Object.entries(data.menu_overrides).forEach(([id, ov]) => {
        if (!ov) return;
        const numId = parseInt(id);
        const existing = liveMenuData.find(m => m.id === numId);

        if (ov._deleted) {
          // Hapus dari live data
          const idx = liveMenuData.findIndex(m => m.id === numId);
          if (idx !== -1) liveMenuData.splice(idx, 1);
          return;
        }

        if (ov._isCustom) {
          // Menu custom — tambah jika belum ada
          if (!existing) {
            liveMenuData.push({
              id:       numId,
              name:     ov.name     || "Menu Baru",
              kategori: ov.kategori || "specials",
              harga:    ov.harga    || 0,
              desc:     ov.desc     || "",
              img:      ov.img      || null,
              status:   ov.status   || "tersedia",
            });
          } else {
            // Update jika sudah ada
            if (ov.name)     existing.name     = ov.name;
            if (ov.kategori) existing.kategori = ov.kategori;
            if (ov.harga  != null) existing.harga  = ov.harga;
            if (ov.desc   != null) existing.desc   = ov.desc;
            if (ov.img    != null) existing.img    = ov.img;
            if (ov.status != null) existing.status = ov.status;
          }
          return;
        }

        // Override menu statis
        if (existing) {
          if (ov.harga  != null) existing.harga  = ov.harga;
          if (ov.status != null) existing.status = ov.status;
          if (ov.img    != null) existing.img    = ov.img;
          if (ov.name   != null) existing.name   = ov.name;
          if (ov.desc   != null) existing.desc   = ov.desc;
        }
      });
    }
  } catch {
    console.info("api/load.php tidak tersedia, gunakan data default.");
  }
}

// ── INIT ───────────────────────────────────────────────────
async function init() {
  // Set badge status otomatis dulu sebelum API selesai
  updateBadgeStatus();
  await loadFromAPI();

  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";
  modalOverlay.id        = "modalOverlay";
  modalOverlay.innerHTML = `<div class="modal" id="modalContent"></div>`;
  modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) closeModal(); });
  document.body.appendChild(modalOverlay);

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", e => {
      searchQuery = e.target.value.trim();
      renderMenu();
    });
  }

  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  renderKategori();
  renderMenu();
}

// Hanya jalankan di halaman publik
if (document.getElementById("menuGrid")) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}

// Expose untuk admin panel
window.liveMenuData     = liveMenuData;
window.liveKategoriData = liveKategoriData;
