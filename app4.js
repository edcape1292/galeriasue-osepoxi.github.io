/* ===== Monedas ===== */
const RATES = {
  MXN: { rate: 1,     symbol: "$", code: "MXN" },
  USD: { rate: 0.060, symbol: "$", code: "USD" },
  EUR: { rate: 0.055, symbol: "€",  code: "EUR" },
  ARS: { rate: 20.00, symbol: "$",  code: "ARS" }
};
let CURRENT = "MXN";

/* ===== Datos base ===== */
const PHONE = "5214428688377";
const productName = "Cuadro de resina 'Ojos de Anime'";
const basePrices = {
  "60 × 40 × 3 cm": 2800,
  "80 × 50 × 3 cm": 3600,
  "90 × 60 × 3 cm": 4500
};

/* ===== Catálogo demo ===== */
const CATALOG = [
  {
    id:"p2",
    name:"Messi y CR7",
    price_mxn:3900,
    img:"fut.png",
    page:"index3.html" // ← Foto 1 abre index3.html
  },
  {
    id:"p3",
    name:"Ojos Populares del Anime",
    price_mxn:1750,
    img:"anime.png",
    page:"index2.html" // ← Foto 2 abre index4.html
  },
  {
    id:"p4",
    name:"Tio Rico",
    price_mxn:3600,
    img:"pato.png",
    page:"index5.html" // ← Foto 3 abre index5.html
  }
];

/* ===== DOM ===== */
const medidaSel      = document.getElementById('medida');
const colorSel       = document.getElementById('color');
const acabadoSel     = document.getElementById('acabado');
const priceTag       = document.getElementById('priceTag');
const countrySelect  = document.getElementById('countrySelect');

function convertFromMXN(amountMXN, currency){ return amountMXN * RATES[currency].rate; }
function formatCurrency(amountMXN, currency=CURRENT){
  const {symbol, code} = RATES[currency];
  return `${symbol}${convertFromMXN(amountMXN, currency).toFixed(2)} ${code}`;
}
function refreshMainPrice(){
  if(!priceTag || !medidaSel) return;
  const base = basePrices[medidaSel.value];
  priceTag.textContent = formatCurrency(base, CURRENT);
}
medidaSel?.addEventListener('change', refreshMainPrice);

/* ===== WhatsApp ===== */

/**
 * Mensaje para cotización del main product (cuadro) con saludo incluido.
 */
function buildWhatsAppMessageMainProductGreeting(){
  const currency = CURRENT;
  const base = basePrices[medidaSel.value];

  return [
    "¡Hola! Gracias por contactarnos 👋. En breve te atenderemos.",
    "",
    `Deseas cotizar el ${productName}.`,
    `Medida: ${medidaSel.value}`,
    `Color: ${colorSel.value}`,
    `Acabado: ${acabadoSel.value}`,
    "",
    `Precio estimado: ${formatCurrency(base, currency)}`,
    "",
    "¿Tiempo de entrega y precio?"
  ].join("\n");
}

/**
 * Mensaje genérico para items (carrito, etc.)
 */
function buildWhatsAppMessageForItems(items){
  const currency = CURRENT;
  if (Array.isArray(items) && items.length){
    let lines = ["¡Hola! Quiero cotizar estos artículos:"];
    items.forEach((it,i)=>{
      lines.push(`${i+1}) ${it.name}${it.medida? " — "+it.medida:""}${it.color? ", "+it.color:""}${it.acabado? ", "+it.acabado:""} — ${formatCurrency(it.price_mxn, currency)}`);
    });
    const totalMXN = items.reduce((a,b)=>a+b.price_mxn,0);
    lines.push(`\nTotal: ${formatCurrency(totalMXN, currency)}`);
    lines.push("\n¿Tiempo de entrega y precio final?");
    return lines.join("\n");
  }
  return "¡Hola! Me ayudas con una cotización, por favor.";
}

/* Botón "Cotizar por WhatsApp" (ficha del cuadro) */
document.getElementById('btnCotizar')?.addEventListener('click', ()=>{
  const text = buildWhatsAppMessageMainProductGreeting();
  const url = "https://wa.me/"+PHONE+"?text="+encodeURIComponent(text);
  window.open(url,'_blank');
});

/* ===== Carrito ===== */
const cartBtn     = document.getElementById('cartBtn');
const cartPanel   = document.getElementById('cartPanel');
const closeCart   = document.getElementById('closeCart');
const cartCount   = document.getElementById('cartCount');
const cartItemsEl = document.getElementById('cartItems');
const cartTotal   = document.getElementById('cartTotal');
const btnAddCart  = document.getElementById('btnAddCart');
const clearCart   = document.getElementById('clearCart');
const checkout    = document.getElementById('checkout');
let cart = [];

function saveCart(){ localStorage.setItem('cart_epoxy', JSON.stringify(cart)); }
function loadCart(){
  try{ cart = JSON.parse(localStorage.getItem('cart_epoxy')) || []; }
  catch{ cart = []; }
  updateCart();
}
function openCart(){ cartPanel?.classList.add('open'); }
function closeCartPanel(){ cartPanel?.classList.remove('open'); }
cartBtn?.addEventListener('click', openCart);
closeCart?.addEventListener('click', closeCartPanel);

btnAddCart?.addEventListener('click', ()=>{
  const item = {
    name: productName,
    medida: medidaSel.value,
    color: colorSel.value,
    acabado: acabadoSel.value,
    price_mxn: basePrices[medidaSel.value]
  };
  cart.push(item);
  updateCart(); openCart();
});

function removeItem(index){ cart.splice(index,1); updateCart(); }
function updateCart(){
  if(!cartCount || !cartItemsEl || !cartTotal) return;
  cartCount.textContent = cart.length;
  cartItemsEl.innerHTML = "";
  let totalMXN = 0;
  if(!cart.length){ cartItemsEl.innerHTML = '<p style="opacity:.8">Tu carrito está vacío.</p>'; }
  cart.forEach((it,idx)=>{
    totalMXN += it.price_mxn;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div>
        <div style="font-weight:700">${it.name}</div>
        <div class="meta">${[it.medida,it.color,it.acabado].filter(Boolean).join(" · ")}</div>
      </div>
      <div style="font-weight:700">${formatCurrency(it.price_mxn, CURRENT)}</div>
      <button class="remove" aria-label="Eliminar" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
    `;
    row.querySelector('.remove').addEventListener('click', ()=>removeItem(idx));
    cartItemsEl.appendChild(row);
  });
  cartTotal.textContent = formatCurrency(totalMXN, CURRENT);
  saveCart();
}
clearCart?.addEventListener('click', ()=>{ cart = []; updateCart(); });
checkout?.addEventListener('click', ()=>{
  if(!cart.length){ alert('Tu carrito está vacío.'); return; }
  const url = "https://wa.me/"+PHONE+"?text="+encodeURIComponent(buildWhatsAppMessageForItems(cart));
  window.open(url,'_blank');
});

/* ===== Catálogo ===== */
const grid = document.getElementById('catalogGrid');
function renderCatalog(){
  if(!grid) return;
  grid.innerHTML = "";
  CATALOG.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'prod';

    card.innerHTML = `
      <a href="${p.page}" class="prod-link">
        <img src="${p.img}" alt="${p.name}">
      </a>
      <div class="pbody">
        <div class="pname">${p.name}</div>
        <div class="prow">
          <span class="pprice">${formatCurrency(p.price_mxn, CURRENT)}</span>
          <button class="pbtn"><i class="fa-solid fa-cart-plus"></i> Agregar</button>
        </div>
      </div>`;

    // Evento: agregar al carrito
    card.querySelector('.pbtn').addEventListener('click', ()=>{
      cart.push({name:p.name, price_mxn:p.price_mxn});
      updateCart(); openCart();
    });

    grid.appendChild(card);
  });
}

/* ===== LIGHTBOX con zoom ===== */
const openLightbox = document.getElementById('openLightbox');
const overlay      = document.getElementById('lightbox');
const lbImg        = document.getElementById('lbImg');
const lbCloseBtn   = document.getElementById('lbClose');
const media        = document.querySelector('.media');
const mainImage    = document.getElementById('mainImage');

let zoomLevel = 1;

function lbOpen(){
  if(!overlay || !lbImg || !media || !mainImage) return;
  lbImg.src = mainImage.currentSrc || mainImage.src;
  media.classList.add('media-hidden');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  zoomLevel = 1;
  lbImg.style.transform = "scale(1)";
}

function lbClose(){
  if(!overlay || !media) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  media.classList.remove('media-hidden');
}

openLightbox?.addEventListener('click', (e)=>{ e.preventDefault(); lbOpen(); });
lbCloseBtn?.addEventListener('click', lbClose);
overlay?.addEventListener('click', (e)=>{ if (e.target === overlay) lbClose(); });
document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') lbClose(); });
lbImg?.addEventListener('wheel', (e)=>{
  e.preventDefault();
  if (e.deltaY < 0) { zoomLevel += 0.1; }
  else if (e.deltaY > 0) { zoomLevel = Math.max(1, zoomLevel - 0.1); }
  lbImg.style.transform = `scale(${zoomLevel})`;
});

/* ===== Cambio de moneda ===== */
countrySelect?.addEventListener('change', ()=>{
  CURRENT = countrySelect.value;
  refreshMainPrice();
  document.querySelectorAll('.pprice').forEach((el, idx)=>{
    el.textContent = formatCurrency(CATALOG[idx].price_mxn, CURRENT);
  });
  updateCart();
});

/* ===== Newsletter + Cupón ===== */
const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbx_RTsfiS8XAkCKWnHfcbxb7vB6hUWGcEqhEtEzFu0AMONVmQofOftZlyX6pBAYJw7D/exec"; // tu enlace web de Google Apps Script

function genCoupon(prefix="ANIME"){
  const part = () => Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,4);
  return `${prefix}-${part()}-${part()}`;
}
function isValidEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

async function sendCoupon(email){
  const savedEmail = localStorage.getItem("newsletter_email");
  const savedCode  = localStorage.getItem("newsletter_coupon_code");
  let codeToSend = savedCode || genCoupon();

  const res = await fetch(GAS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code: codeToSend, source: "newsletter" })
  });
  const data = await res.json();
  if(!data.ok) throw new Error(data.error || "Error al enviar");

  localStorage.setItem("newsletter_email", email);
  localStorage.setItem("newsletter_coupon_code", data.code || codeToSend);
  localStorage.setItem("newsletter_coupon_sent", "1");
  return data;
}

document.getElementById('btnSeguirShop')?.addEventListener('click', async ()=>{
  const emailInput = document.getElementById('email');
  const email = emailInput.value.trim();
  if(!isValidEmail(email)){ alert('Por favor, ingresa un correo válido.'); emailInput.focus(); return; }

  const btn = document.getElementById('btnSeguirShop');
  const old = btn.textContent; btn.disabled = true; btn.textContent = "Enviando...";

  try{
    const { status, code } = await sendCoupon(email);
    const label = status === "existing"
      ? "¡Ya estabas suscrito! Reenviamos tu cupón:"
      : "¡Gracias por suscribirte! Aquí tu cupón:";
    alert(`${label}\n\n${code}`);
    emailInput.value = "";
  }catch(e){
    console.error(e);
    alert("Hubo un problema al enviar el cupón. Intenta más tarde.");
  }finally{
    btn.disabled = false; btn.textContent = old;
  }
});

/* ===== Init ===== */
function init(){ renderCatalog(); refreshMainPrice(); loadCart(); }
init();
