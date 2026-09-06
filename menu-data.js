// menu-data.js — Data menu & kategori Kedai Kenshin
// Edit file ini untuk menambah/menghapus menu.

// ── DATA KATEGORI ──────────────────────────────────────────
const kategoriData = [
  { id: "semua",              name: "Semua Menu",          jp: "すべて",                icon: "🍽️" },
  { id: "paket-liwet",        name: "Paket Liwet",         jp: "パケットリウェット",      icon: "🍚" },
  { id: "astor",              name: "Astor",               jp: "アスター",               icon: "🧆" },
  { id: "indonesian-foods",   name: "Indonesian Foods",    jp: "インドネシアフード",      icon: "🥘" },
  { id: "angkringan-fried",   name: "Angkringan Fried",    jp: "揚げ物",                icon: "🍗" },
  { id: "angkringan-skewers", name: "Angkringan Skewers",  jp: "串揚き",                icon: "🍢" },
  { id: "drinks",             name: "Drinks",              jp: "飲み物",                icon: "🧋" },
  { id: "seblak-base",        name: "Seblak Base",         jp: "セブラックベース",        icon: "🌶️" },
  { id: "topping",            name: "Topping",             jp: "トッピング",             icon: "➕" },
  { id: "specials",           name: "Specials",            jp: "スペシャル",             icon: "⭐" },
  { id: "indonesian-ramen",   name: "Indonesian Ramen",    jp: "インドネシアラーメン",    icon: "🍜" },
  { id: "nasi-kucing",        name: "Nasi Kucing",         jp: "ナシクチン",             icon: "🍙" },
  { id: "seafood",            name: "Seafood",             jp: "シーフード",             icon: "🦐" },
  { id: "halal-izakaya",      name: "Halal Izakaya",       jp: "ハラル居酒屋メニュー",   icon: "🏮" },
  { id: "sembako",            name: "Sembako",             jp: "食料品",                icon: "🛒" },
  { id: "gaming-rental",      name: "Gaming Rental",       jp: "ゲームレンタル",         icon: "🎮" },
  { id: "snacks",             name: "Snacks",              jp: "お菓子",                icon: "🍿" },
  { id: "bungkus",            name: "Bungkus",             jp: "持ち帰り",              icon: "📦" },
];

// ── DATA MENU ──────────────────────────────────────────────
// Untuk gambar: taruh file di images/menu/ lalu sesuaikan field img
// Nama file gambar = nama menu huruf kecil, spasi → tanda hubung, mis: "liwet-ayam-bakar.jpg"
const menuData = [

  // ── PAKET LIWET ───────────────────────────────────────────
  {
    id: 1,
    name: "Liwet Ayam Bakar",
    kategori: "paket-liwet",
    harga: 1200,
    desc: "Nasi liwet disajikan dengan ayam bakar pilihan, lalapan segar, dan sambal khas Kenshin.",
    img: "images/menu/liwet-ayam-bakar.jpg",
    status: "tersedia"
  },
  {
    id: 2,
    name: "Liwet Lele",
    kategori: "paket-liwet",
    harga: 1200,
    desc: "Nasi liwet gurih dengan lele goreng crispy, lalapan, dan sambal terasi.",
    img: "images/menu/liwet-lele.jpg",
    status: "tersedia"
  },
  {
    id: 3,
    name: "Liwet Ayam",
    kategori: "paket-liwet",
    harga: 1200,
    desc: "Nasi liwet hangat dengan potongan ayam goreng, lalapan, dan sambal.",
    img: "images/menu/liwet-ayam.jpg",
    status: "tersedia"
  },
  {
    id: 4,
    name: "Paket Liwet",
    kategori: "paket-liwet",
    harga: 4800,
    desc: "Paket liwet lengkap untuk 2-3 orang: nasi liwet, lauk pilihan, lalapan, tahu tempe, dan es teh gratis.",
    img: "images/menu/paket-liwet.jpg",
    status: "tersedia"
  },

  // ── SEAFOOD ───────────────────────────────────────────────
  {
    id: 5,
    name: "Kepiting Saus Padang",
    kategori: "seafood",
    harga: 1600,
    desc: "Kepiting segar dimasak dengan saus padang pedas gurih yang kaya rempah.",
    img: "images/menu/kepiting-saus-padang.jpg",
    status: "habis"
  },

  // ── INDONESIAN FOODS ──────────────────────────────────────
  {
    id: 6,
    name: "Ketoprak",
    kategori: "indonesian-foods",
    harga: 1000,
    desc: "Ketoprak segar dengan tahu, bihun, ketupat, taoge, dan siraman bumbu kacang khas.",
    img: "images/menu/ketoprak.jpg",
    status: "habis"
  },
  {
    id: 7,
    name: "Cigor",
    kategori: "indonesian-foods",
    harga: 600,
    desc: "Aci goreng crispy dengan bumbu tabur gurih, camilan favorit semua kalangan.",
    img: "images/menu/cigor.jpg",
    status: "habis"
  },

  // ── DRINKS ────────────────────────────────────────────────
  {
    id: 8,
    name: "Pop Ice Durian",
    kategori: "drinks",
    harga: 250,
    desc: "Minuman segar Pop Ice rasa durian, creamy dan wangi, sensasi durian dalam segelas.",
    img: "images/menu/pop-ice-durian.jpg",
    status: "tersedia"
  },
  {
    id: 9,
    name: "Pop Ice Coklat",
    kategori: "drinks",
    harga: 250,
    desc: "Pop Ice rasa coklat, dingin dan manis, cocok untuk semua usia.",
    img: "images/menu/pop-ice-coklat.jpg",
    status: "tersedia"
  },
  {
    id: 10,
    name: "Pop Ice Strawberry",
    kategori: "drinks",
    harga: 250,
    desc: "Pop Ice rasa strawberry segar dengan warna merah menggoda.",
    img: "images/menu/pop-ice-strawberry.jpg",
    status: "tersedia"
  },

  // ── ANGKRINGAN SKEWERS ────────────────────────────────────
  {
    id: 11,
    name: "Satay One Set",
    kategori: "angkringan-skewers",
    harga: 2500,
    desc: "Satu set sate pilihan dengan bumbu kacang khas Kedai Kenshin, disajikan panas.",
    img: "images/menu/satay-one-set.jpg",
    status: "tersedia"
  },

  // ── BUNGKUS ───────────────────────────────────────────────
  {
    id: 12,
    name: "Box Take Out",
    kategori: "bungkus",
    harga: 3500,
    desc: "Paket take out Kedai Kenshin, nikmati menu favorit di mana saja.",
    img: "images/menu/box-takeout.jpg",
    status: "tersedia"
  },

  // ── ANGKRINGAN FRIED ──────────────────────────────────────
  {
    id: 13,
    name: "Ebi Fray",
    kategori: "angkringan-fried",
    harga: 600,
    desc: "Udang goreng tepung crispy renyah, disajikan dengan saus tartar atau sambal.",
    img: "images/menu/ebi-fray.jpg",
    status: "tersedia"
  },
  {
    id: 14,
    name: "Bakwan Jagung",
    kategori: "angkringan-fried",
    harga: 450,
    desc: "Bakwan jagung manis goreng renyah, hangat dan gurih, cocok sebagai camilan.",
    img: "images/menu/bakwan-jagung.jpg",
    status: "tersedia"
  },
  {
    id: 15,
    name: "Risol",
    kategori: "angkringan-fried",
    harga: 450,
    desc: "Risol isi sayuran dan ragout, dibalut tepung roti lalu digoreng crispy.",
    img: "images/menu/risol.jpg",
    status: "tersedia"
  },

  // ── DRINKS (tambahan) ─────────────────────────────────────
  {
    id: 16,
    name: "Lava Ice",
    kategori: "drinks",
    harga: 450,
    desc: "Minuman es segar dengan efek lava yang cantik, perpaduan rasa manis dan segar.",
    img: "images/menu/lava-ice.jpg",
    status: "tersedia"
  },
  {
    id: 17,
    name: "Wedang Uwuh",
    kategori: "drinks",
    harga: 250,
    desc: "Minuman tradisional rempah Jawa — jahe, kayu secang, cengkeh, dan pala. Hangat dan menyehatkan.",
    img: "images/menu/wedang-uwuh.jpg",
    status: "tersedia"
  },
  {
    id: 18,
    name: "Pop Ice Permen Karet",
    kategori: "drinks",
    harga: 250,
    desc: "Pop Ice rasa permen karet berwarna biru cerah, segar dan unik.",
    img: "images/menu/pop-ice-permen-karet.jpg",
    status: "tersedia"
  },
  {
    id: 19,
    name: "Wedang Jahe Merah",
    kategori: "drinks",
    harga: 250,
    desc: "Wedang jahe merah hangat, kaya manfaat, menghangatkan tubuh dan meningkatkan imun.",
    img: "images/menu/wedang-jahe-merah.jpg",
    status: "tersedia"
  },
  {
    id: 20,
    name: "Beng-Beng Drink",
    kategori: "drinks",
    harga: 250,
    desc: "Minuman coklat creamy khas Beng-Beng, manis dan kaya rasa coklat karamel.",
    img: "images/menu/beng-beng-drink.jpg",
    status: "tersedia"
  },

  // ── INDONESIAN FOODS (tambahan) ───────────────────────────
  {
    id: 21,
    name: "Nasi Goreng Seafood",
    kategori: "indonesian-foods",
    harga: 1000,
    desc: "Nasi goreng dengan topping seafood pilihan — udang, cumi, dan telur. Disajikan dengan lumpia dan lalapan.",
    img: "images/menu/nasi-goreng-seafood.jpg",
    status: "tersedia"
  },
  {
    id: 22,
    name: "Ayam Goreng Tamping",
    kategori: "indonesian-foods",
    harga: 650,
    desc: "Ayam goreng crispy khas tamping, disajikan dengan lalapan segar dan sambal.",
    img: "images/menu/ayam-goreng-tamping.jpg",
    status: "tersedia"
  },
  {
    id: 23,
    name: "Ayam Bakar Tamping",
    kategori: "indonesian-foods",
    harga: 650,
    desc: "Ayam bakar empuk dengan bumbu rempah meresap, disajikan dengan lalapan dan sambal.",
    img: "images/menu/ayam-bakar-tamping.jpg",
    status: "tersedia"
  },
  {
    id: 24,
    name: "Ikan Bakar",
    kategori: "indonesian-foods",
    harga: 1250,
    desc: "Ikan bakar segar dengan bumbu kecap dan rempah, disajikan dengan lalapan, tomat, dan sambal.",
    img: "images/menu/ikan-bakar.jpg",
    status: "tersedia"
  },
  {
    id: 25,
    name: "Ikan Bakar + Nasi",
    kategori: "indonesian-foods",
    harga: 1450,
    desc: "Paket ikan bakar lengkap dengan nasi putih, lalapan, tomat, dan sambal khas Kenshin.",
    img: "images/menu/ikan-bakar-nasi.jpg",
    status: "tersedia"
  },

  // ── ANGKRINGAN FRIED (tambahan) ───────────────────────────
  {
    id: 26,
    name: "Aji Fray",
    kategori: "angkringan-fried",
    harga: 600,
    desc: "Ayam fillet goreng tepung crispy khas Jepang, disajikan dengan irisan lemon dan saus.",
    img: "images/menu/aji-fray.jpg",
    status: "tersedia"
  },

  // ── DRINKS (tambahan) ─────────────────────────────────────
  {
    id: 27,
    name: "Coca Cola",
    kategori: "drinks",
    harga: 250,
    desc: "Coca Cola rasa klasik, segar dan cocok menemani semua menu.",
    img: "images/menu/coca-cola.jpg",
    status: "tersedia"
  },
  {
    id: 28,
    name: "Wedang Bajigur",
    kategori: "drinks",
    harga: 250,
    desc: "Minuman tradisional Sunda dari santan, gula aren, dan rempah. Hangat dan manis alami.",
    img: "images/menu/wedang-bajigur.jpg",
    status: "tersedia"
  },

  // ── DRINKS (tambahan) ─────────────────────────────────────
  {
    id: 29,
    name: "Matcha Latte",
    kategori: "drinks",
    harga: 450,
    desc: "Matcha latte creamy dengan perpaduan teh hijau premium dan susu segar. Segar dan menyehatkan.",
    img: "images/menu/matcha-latte.jpg",
    status: "tersedia"
  },
  {
    id: 30,
    name: "Melon Coctail",
    kategori: "drinks",
    harga: 450,
    desc: "Minuman koktail melon segar dengan es batu, manis dan menyegarkan.",
    img: "images/menu/melon-coctail.jpg",
    status: "tersedia"
  },
  {
    id: 31,
    name: "Fanta",
    kategori: "drinks",
    harga: 250,
    desc: "Fanta kaleng rasa anggur, segar dan manis, cocok menemani makan.",
    img: "images/menu/fanta.jpg",
    status: "tersedia"
  },
  {
    id: 32,
    name: "Etta Goat Milk",
    kategori: "drinks",
    harga: 450,
    desc: "Susu kambing Etta segar dan bergizi, creamy dengan manfaat kesehatan yang tinggi.",
    img: "images/menu/etta-goat-milk.jpg",
    status: "tersedia"
  },

  // ── INDONESIAN FOODS (tambahan) ───────────────────────────
  {
    id: 33,
    name: "Ayam Bakar Nasi Putih",
    kategori: "indonesian-foods",
    harga: 1200,
    desc: "Ayam bakar empuk berbumbu dengan nasi putih hangat, lalapan, tomat, dan sambal.",
    img: "images/menu/ayam-bakar-nasi-putih.jpg",
    status: "tersedia"
  },
  {
    id: 34,
    name: "Nasi Goreng Ayam",
    kategori: "indonesian-foods",
    harga: 1000,
    desc: "Nasi goreng dengan potongan ayam, telur, dan lumpia, disajikan dengan lalapan.",
    img: "images/menu/nasi-goreng-ayam.jpg",
    status: "tersedia"
  },
  {
    id: 35,
    name: "Nasi Goreng Kambing",
    kategori: "indonesian-foods",
    harga: 1000,
    desc: "Nasi goreng dengan daging kambing pilihan, telur, dan lumpia. Kaya rasa dan aroma.",
    img: "images/menu/nasi-goreng-kambing.jpg",
    status: "tersedia"
  },

  // ── SEAFOOD (tambahan) ────────────────────────────────────
  {
    id: 36,
    name: "Seafood Bancakan",
    kategori: "seafood",
    harga: 6000,
    desc: "Paket bancakan seafood lengkap: kepiting, udang, kerang, dan cumi. Cocok untuk makan bersama.",
    img: "images/menu/seafood-bancakan.jpg",
    status: "tersedia"
  },

  // ── DRINKS (tambahan) ─────────────────────────────────────
  {
    id: 37,
    name: "Pop Ice Vanilla Blue",
    kategori: "drinks",
    harga: 250,
    desc: "Pop Ice rasa vanilla blue yang unik, creamy dan segar dengan warna biru cantik.",
    img: "images/menu/pop-ice-vanilla-blue.jpg",
    status: "tersedia"
  },
  {
    id: 38,
    name: "Pop Ice Mango",
    kategori: "drinks",
    harga: 250,
    desc: "Pop Ice rasa mangga segar, manis dan wangi buah mangga asli.",
    img: "images/menu/pop-ice-mango.jpg",
    status: "tersedia"
  },

  // ── INDONESIAN FOODS (tambahan) ───────────────────────────
  {
    id: 39,
    name: "Nasi Pontianak",
    kategori: "indonesian-foods",
    harga: 1000,
    desc: "Nasi khas Pontianak dengan topping telur, bumbu rempah khas, dan pelengkap lezat.",
    img: "images/menu/nasi-pontianak.jpg",
    status: "tersedia"
  },

  // ── ANGKRINGAN FRIED (tambahan) ───────────────────────────
  {
    id: 40,
    name: "Mendoan",
    kategori: "angkringan-fried",
    harga: 330,
    desc: "Tempe mendoan khas Banyumas, tipis dan lembut dibalut tepung bumbu, digoreng setengah matang.",
    img: "images/menu/mendoan.jpg",
    status: "tersedia"
  },
  {
    id: 41,
    name: "Tahu Goreng",
    kategori: "angkringan-fried",
    harga: 300,
    desc: "Tahu goreng crispy di luar, lembut di dalam. Cocok sebagai camilan atau lauk.",
    img: "images/menu/tahu-goreng.jpg",
    status: "tersedia"
  },
  {
    id: 42,
    name: "Tahu Isi",
    kategori: "angkringan-fried",
    harga: 450,
    desc: "Tahu isi dengan sayuran dan bumbu rempah, digoreng hingga crispy keemasan.",
    img: "images/menu/tahu-isi.jpg",
    status: "tersedia"
  },

  // ── SPECIALS ──────────────────────────────────────────────
  {
    id: 43,
    name: "Paket Hot Dog",
    kategori: "specials",
    harga: 800,
    desc: "Paket hot dog spesial dengan sosis jumbo, saus, dan minuman segar.",
    img: "images/menu/paket-hot-dog.jpg",
    status: "tersedia"
  },
  {
    id: 44,
    name: "Burger Paket",
    kategori: "specials",
    harga: 800,
    desc: "Burger spesial dengan patty daging, keju, sayuran, dan saus pilihan. Disajikan dengan minuman.",
    img: "images/menu/burger-paket.jpg",
    status: "tersedia"
  },

  // ── DRINKS (tambahan) ─────────────────────────────────────
  {
    id: 45,
    name: "Pop Ice Vanilla Latte",
    kategori: "drinks",
    harga: 250,
    desc: "Pop Ice rasa vanilla latte, perpaduan vanilla creamy dengan sentuhan kopi yang lembut.",
    img: "images/menu/pop-ice-vanilla-latte.jpg",
    status: "habis"
  },
  {
    id: 46,
    name: "BaliHai Beer",
    kategori: "drinks",
    harga: 600,
    desc: "BaliHai Beer premium, segar dan ringan. Cocok menemani malam di Kedai Kenshin.",
    img: "images/menu/balihai-beer.jpg",
    status: "habis"
  },
  {
    id: 47,
    name: "Bir Bintang",
    kategori: "drinks",
    harga: 600,
    desc: "Bir Bintang botol premium, minuman khas Indonesia yang segar dan ringan.",
    img: "images/menu/bir-bintang.jpg",
    status: "tersedia"
  },
  {
    id: 48,
    name: "Wedang Sereh Jahe Nipis",
    kategori: "drinks",
    harga: 250,
    desc: "Wedang hangat dari sereh, jahe, dan perasan jeruk nipis. Menyegarkan dan menyehatkan.",
    img: "images/menu/wedang-sereh-jahe-nipis.jpg",
    status: "tersedia"
  },
  {
    id: 49,
    name: "Indocafe Coffe Mix",
    kategori: "drinks",
    harga: 250,
    desc: "Kopi Indocafe Original Mix yang khas, creamy dan harum. Disajikan dengan es batu.",
    img: "images/menu/indocafe-coffe-mix.jpg",
    status: "habis"
  },

  // ── INDONESIAN FOODS (tambahan) ───────────────────────────
  {
    id: 50,
    name: "Ketoprak Spesial",
    kategori: "indonesian-foods",
    harga: 1100,
    desc: "Ketoprak spesial dengan tahu, bihun, ketupat, taoge, telur, dan siraman bumbu kacang ekstra.",
    img: "images/menu/ketoprak-spesial.jpg",
    status: "habis"
  },
  {
    id: 51,
    name: "Nasi Bakar",
    kategori: "indonesian-foods",
    harga: 250,
    desc: "Nasi bakar khas dengan isian bumbu rempah, dibungkus daun pisang dan dibakar harum.",
    img: "images/menu/nasi-bakar.jpg",
    status: "tersedia"
  },

  // ── ANGKRINGAN FRIED (tambahan) ───────────────────────────
  {
    id: 52,
    name: "Karage",
    kategori: "angkringan-fried",
    harga: 650,
    desc: "Ayam karaage khas Jepang, dimarinasi bumbu shoyu dan digoreng hingga crispy renyah.",
    img: "images/menu/karage.jpg",
    status: "tersedia"
  },

  // ── DRINKS (tambahan) ─────────────────────────────────────
  {
    id: 53,
    name: "Good Day Cappucino",
    kategori: "drinks",
    harga: 250,
    desc: "Good Day Cappucino hangat, kopi creamy dengan aroma cappucino yang khas dan lembut.",
    img: "images/menu/good-day-cappucino.jpg",
    status: "habis"
  },
  {
    id: 54,
    name: "Nutrisari Jambu",
    kategori: "drinks",
    harga: 250,
    desc: "Nutrisari rasa jambu biji, segar manis dan kaya vitamin C.",
    img: "images/menu/nutrisari-jambu.jpg",
    status: "tersedia"
  },
  {
    id: 55,
    name: "Nutrisari Jeruk Peras",
    kategori: "drinks",
    harga: 250,
    desc: "Nutrisari rasa jeruk peras segar, manis asam menyegarkan, kaya vitamin C.",
    img: "images/menu/nutrisari-jeruk-peras.jpg",
    status: "tersedia"
  },
  {
    id: 56,
    name: "Black Coffee",
    kategori: "drinks",
    harga: 250,
    desc: "Kopi hitam pekat, disajikan panas atau dingin. Pilihan para pecinta kopi murni.",
    img: "images/menu/black-coffee.jpg",
    status: "tersedia"
  },
  {
    id: 57,
    name: "Coffee Latte",
    kategori: "drinks",
    harga: 250,
    desc: "Coffee latte dengan espresso dan susu steamed, creamy dan harum.",
    img: "images/menu/coffee-latte.jpg",
    status: "tersedia"
  },

  // ── SEBLAK BASE ───────────────────────────────────────────
  {
    id: 58,
    name: "Seblak Base",
    kategori: "seblak-base",
    harga: 350,
    desc: "Seblak base khas Kenshin dengan kerupuk basah, bumbu kencur pedas gurih yang menggugah selera.",
    img: "images/menu/seblak-base.jpg",
    status: "tersedia"
  },

  // ── TOPPING ───────────────────────────────────────────────
  {
    id: 59,
    name: "Topping Seblak",
    kategori: "topping",
    harga: 90,
    desc: "Tambahan topping pilihan untuk seblak: ceker, siomay, makaroni, telur, dan lainnya.",
    img: "images/menu/topping-seblak.jpg",
    status: "tersedia"
  },

  // ── PAKET LIWET (tambahan) ────────────────────────────────
  {
    id: 60,
    name: "Es Teh Manis",
    kategori: "paket-liwet",
    harga: 200,
    desc: "Es teh manis segar, minuman klasik Indonesia yang cocok menemani paket liwet.",
    img: "images/menu/es-teh-manis.jpg",
    status: "tersedia"
  },

  // ── DRINKS (tambahan) ─────────────────────────────────────
  {
    id: 61,
    name: "Ice Lava + Topping Strawberry",
    kategori: "drinks",
    harga: 450,
    desc: "Es lava creamy dengan topping strawberry segar di atasnya. Perpaduan manis asam yang menggoda.",
    img: "images/menu/ice-lava-topping-strawberry.jpg",
    status: "tersedia"
  },

  // ── ANGKRINGAN SKEWERS (tambahan) ─────────────────────────
  {
    id: 62,
    name: "Sate Bakso",
    kategori: "angkringan-skewers",
    harga: 300,
    desc: "Sate bakso kenyal berbumbu bacem khas angkringan, dibakar hingga harum dan lezat.",
    img: "images/menu/sate-bakso.jpg",
    status: "tersedia"
  },
  {
    id: 63,
    name: "Sate Ceker",
    kategori: "angkringan-skewers",
    harga: 300,
    desc: "Sate ceker ayam empuk berbumbu gurih manis, dibakar sempurna dengan aroma khas angkringan.",
    img: "images/menu/sate-ceker.jpg",
    status: "tersedia"
  },
  {
    id: 64,
    name: "Sate Ati / Liver Satay",
    kategori: "angkringan-skewers",
    harga: 300,
    desc: "Sate ati ayam bertekstur lembut dengan bumbu bacem manis gurih, dibakar hingga matang sempurna.",
    img: "images/menu/sate-ati.jpg",
    status: "tersedia"
  },
  {
    id: 65,
    name: "Sate Usus",
    kategori: "angkringan-skewers",
    harga: 300,
    desc: "Sate usus ayam dengan bumbu kecap manis dan rempah pilihan, dibakar hingga kecokelatan.",
    img: "images/menu/sate-usus.jpg",
    status: "tersedia"
  },
  {
    id: 66,
    name: "Sate Sosis",
    kategori: "angkringan-skewers",
    harga: 300,
    desc: "Sate sosis juicy berbumbu manis gurih, dibakar grill dengan aroma yang menggugah selera.",
    img: "images/menu/sate-sosis.jpg",
    status: "tersedia"
  },
  {
    id: 67,
    name: "Sate Telur Puyuh",
    kategori: "angkringan-skewers",
    harga: 300,
    desc: "Sate telur puyuh berbumbu bacem khas Kenshin, manis gurih dan kenyal dalam satu tusuk.",
    img: "images/menu/sate-telur-puyuh.jpg",
    status: "tersedia"
  },
  {
    id: 68,
    name: "Sate Sayap",
    kategori: "angkringan-skewers",
    harga: 300,
    desc: "Sate sayap ayam empuk dengan bumbu kecap rempah, dibakar hingga harum kecokelatan.",
    img: "images/menu/sate-sayap.jpg",
    status: "tersedia"
  },

  // ── ANGKRINGAN SKEWERS (tambahan) ─────────────────────────
  {
    id: 69,
    name: "Sate Kulit Ayam",
    kategori: "angkringan-skewers",
    harga: 300,
    desc: "Sate kulit ayam crispy berbumbu gurih manis, dibakar hingga kecokelatan dan harum.",
    img: "images/menu/sate-kulit-ayam.jpg",
    status: "tersedia"
  },

  // ── INDONESIAN FOODS (tambahan) ───────────────────────────
  {
    id: 70,
    name: "Mie Goreng",
    kategori: "indonesian-foods",
    harga: 650,
    desc: "Mie goreng khas dengan telur, bakso, dan bumbu rempah pilihan. Disajikan dengan acar dan kerupuk.",
    img: "images/menu/mie-goreng.jpg",
    status: "habis"
  },
  {
    id: 71,
    name: "Nasi Kuning Special",
    kategori: "indonesian-foods",
    harga: 1000,
    desc: "Nasi kuning gurih dengan lauk lengkap: ayam suwir, telur balado, tempe, dan lalapan. Spesial Kenshin.",
    img: "images/menu/nasi-kuning-special.jpg",
    status: "tersedia"
  },
  {
    id: 72,
    name: "Batagor",
    kategori: "indonesian-foods",
    harga: 600,
    desc: "Bakso tahu goreng crispy khas Bandung, disajikan dengan siraman bumbu kacang dan kecap.",
    img: "images/menu/batagor.jpg",
    status: "tersedia"
  },
  {
    id: 73,
    name: "Rice / Nasi Putih",
    kategori: "indonesian-foods",
    harga: 250,
    desc: "Nasi putih hangat pulen, pelengkap sempurna untuk semua lauk di Kedai Kenshin.",
    img: "images/menu/nasi-putih.jpg",
    status: "tersedia"
  },
  {
    id: 74,
    name: "Empal Gentong",
    kategori: "indonesian-foods",
    harga: 1490,
    desc: "Empal gentong khas Cirebon — daging sapi empuk dalam kuah santan rempah yang kaya dan gurih.",
    img: "images/menu/empal-gentong.jpg",
    status: "tersedia"
  },
  {
    id: 75,
    name: "Nasi Lengko",
    kategori: "indonesian-foods",
    harga: 1000,
    desc: "Nasi lengko khas Cirebon dengan tahu, tempe, taoge, timun, dan siraman bumbu kacang kecap.",
    img: "images/menu/nasi-lengko.jpg",
    status: "tersedia"
  },
  {
    id: 76,
    name: "Kepala Ikan Rica Rica",
    kategori: "indonesian-foods",
    harga: 1200,
    desc: "Kepala ikan segar dimasak rica rica pedas dengan cabai merah, tomat, dan rempah khas Manado.",
    img: "images/menu/kepala-ikan-rica-rica.jpg",
    status: "tersedia"
  },

  // ── INDONESIAN FOODS (tambahan) ───────────────────────────
  {
    id: 77,
    name: "Pecel Ayam",
    kategori: "indonesian-foods",
    harga: 1200,
    desc: "Ayam goreng crispy dengan siraman sambal pecel kacang khas, disajikan dengan lalapan dan nasi.",
    img: "images/menu/pecel-ayam.jpg",
    status: "tersedia"
  },
  {
    id: 78,
    name: "Mie Ayam Special",
    kategori: "indonesian-foods",
    harga: 1000,
    desc: "Mie ayam spesial dengan topping ayam cincang, pangsit goreng, bakso, dan telur rebus. Kuah gurih khas.",
    img: "images/menu/mie-ayam-special.jpg",
    status: "habis"
  },

  // ── PAKET LIWET (tambahan) ────────────────────────────────
  {
    id: 79,
    name: "Mie Ayam",
    kategori: "paket-liwet",
    harga: 1000,
    desc: "Mie ayam gurih dengan topping ayam cincang bumbu khas, pangsit, dan kuah kaldu segar.",
    img: "images/menu/mie-ayam.jpg",
    status: "habis"
  },

  // ── NASI KUCING ───────────────────────────────────────────
  {
    id: 80,
    name: "Nasi Bakar Isi Ikan Teri",
    kategori: "nasi-kucing",
    harga: 250,
    desc: "Nasi bakar isi ikan teri sambal yang gurih, dibungkus daun pisang dan dibakar hingga harum.",
    img: "images/menu/nasi-bakar-isi-ikan-teri.jpg",
    status: "habis"
  },
  {
    id: 81,
    name: "Nasi Bakar Isi Ayam",
    kategori: "nasi-kucing",
    harga: 250,
    desc: "Nasi bakar isi ayam suwir bumbu rempah, dibungkus daun pisang dan dibakar wangi.",
    img: "images/menu/nasi-bakar-isi-ayam.jpg",
    status: "habis"
  },
  {
    id: 82,
    name: "Nasi Bakar Isi Tempe",
    kategori: "nasi-kucing",
    harga: 250,
    desc: "Nasi bakar isi tempe orek gurih pedas, dibungkus daun pisang dan dibakar hingga harum.",
    img: "images/menu/nasi-bakar-isi-tempe.jpg",
    status: "habis"
  },

  // ── ASTOR ─────────────────────────────────────────────────
  {
    id: 83,
    name: "Candy Marking Esse",
    kategori: "astor",
    harga: 630,
    desc: "Candy marking esse khas Kedai Kenshin, camilan manis unik dengan cita rasa yang berbeda.",
    img: "images/menu/candy-marking-esse.jpg",
    status: "tersedia"
  },

  // ── ANGKRINGAN FRIED (tambahan) ───────────────────────────
  {
    id: 84,
    name: "Cireng Ayam",
    kategori: "angkringan-fried",
    harga: 450,
    desc: "Cireng aci goreng isi ayam suwir bumbu rempah, crispy di luar dan lembut di dalam. Disajikan dengan daun bawang.",
    img: "images/menu/cireng-ayam.jpg",
    status: "tersedia"
  },

  // ── Tambahkan menu baru di bawah ini ──────────────────────
  // {
  //   id: 85,
  //   name: "Nama Menu",
  //   kategori: "id-kategori",
  //   harga: 500,
  //   desc: "Deskripsi menu.",
  //   img: "images/menu/nama-file.jpg",
  //   status: "tersedia"  // atau "habis"
  // },
];
