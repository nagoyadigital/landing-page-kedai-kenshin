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
    ? `<img class="menu-img" src="${item.img}" alt="${item.name}" loading="lazy"
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
        <button class="btn-order" ${item.status === "habis" ? "disabled" : ""} data-id="${item.id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          Pesan
        </button>
      </div>
    </div>
  `;

  card.addEventListener("click", e => {
    if (!e.target.closest(".btn-order")) openModal(item);
  });
  card.querySelector(".btn-order")?.addEventListener("click", e => {
    e.stopPropagation();
    if (item.status !== "habis") orderWhatsApp(item);
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
    ? `<img class="modal-img" src="${item.img}" alt="${item.name}"
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
        <a href="#" class="btn-wa" id="btnWaModal"
           ${item.status === "habis" ? "style='opacity:0.5;pointer-events:none'" : ""}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          ${item.status === "habis" ? "Habis" : "Pesan via WhatsApp"}
        </a>
      </div>
    </div>
  `;

  overlay.classList.add("open");
  document.getElementById("btnCloseModal")?.addEventListener("click", closeModal);
  document.getElementById("btnWaModal")?.addEventListener("click", e => {
    e.preventDefault();
    orderWhatsApp(item);
  });
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

// ── LOAD DATA DARI API ─────────────────────────────────────
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
    const badge = document.querySelector(".badge-open");
    if (badge && data.settings?.status_buka === false) {
      badge.textContent = "● Tutup";
      badge.style.background = "var(--red)";
    }

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
