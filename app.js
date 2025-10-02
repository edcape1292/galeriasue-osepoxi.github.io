/* ==== Mini chat (demo) ==== */
const openBtn = document.getElementById('openMiniChat');
const miniChat = document.getElementById('miniChat');
const closeBtn = document.getElementById('closeMiniChat');
const bodyEl = document.getElementById('chatBody');
const inputEl = document.getElementById('msgText');
const sendBtn = document.getElementById('sendMsg');

function escapeHtml(str){
  return str.replace(/[&<>'"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[s]));
}
function appendMessage(author, text){
  const row = document.createElement('div');
  row.className = 'msg';
  row.innerHTML = `<b>${author}:</b> ${escapeHtml(text)}`;
  bodyEl.appendChild(row);
  bodyEl.scrollTop = bodyEl.scrollHeight;
}
openBtn?.addEventListener('click', () => {
  miniChat.classList.add('open');
  miniChat.setAttribute('aria-hidden', 'false');
  inputEl?.focus();
});
closeBtn?.addEventListener('click', () => {
  miniChat.classList.remove('open');
  miniChat.setAttribute('aria-hidden', 'true');
});
function send(){
  const val = inputEl.value.trim();
  if(!val) return;
  appendMessage('Tú', val);
  inputEl.value = '';
  setTimeout(() => appendMessage('GE', '¡Gracias por escribir! (Demo)'), 600);
}
sendBtn?.addEventListener('click', send);
inputEl?.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    send();
  }
});

/* ==== Carrito interactivo (header + animación) ==== */
const headerCart = document.getElementById('headerCart');
const cartCountEl = document.getElementById('cartCount');

function loadCart(){
  try{ return JSON.parse(localStorage.getItem('gse_cart')||'{}'); }catch{ return {}; }
}
function saveCart(c){ localStorage.setItem('gse_cart', JSON.stringify(c)); }
function getCartCount(c){ return Object.values(c).reduce((s,n)=> s + (typeof n==='number'? n : n.qty||0), 0); }
function updateCartBadge(){
  const c = loadCart();
  const cnt = getCartCount(c);
  if(cartCountEl){
    cartCountEl.textContent = cnt;
    cartCountEl.classList.remove('bump');
    void cartCountEl.offsetWidth; // reflow
    cartCountEl.classList.add('bump');
  }
}
updateCartBadge();

function addToCart(title, meta = {}){
  const c = loadCart();
  if(!c[title]) c[title] = { qty:0, ...meta };
  c[title].qty += 1;
  saveCart(c);
  updateCartBadge();
}
function flyToCart(fromImg){
  if(!fromImg || !headerCart) return;
  const imgRect = fromImg.getBoundingClientRect();
  const cartRect = headerCart.getBoundingClientRect();
  const clone = fromImg.cloneNode(true);
  Object.assign(clone.style, {
    position:'fixed', left:imgRect.left+'px', top:imgRect.top+'px',
    width:imgRect.width+'px', height:imgRect.height+'px',
    borderRadius:'10px', zIndex:'1000',
    transition:'transform .7s cubic-bezier(.2,.65,.2,1), opacity .7s ease'
  });
  document.body.appendChild(clone);
  const dx = (cartRect.left + cartRect.width/2) - (imgRect.left + imgRect.width/2);
  const dy = (cartRect.top + cartRect.height/2) - (imgRect.top + imgRect.height/2);
  requestAnimationFrame(()=>{
    clone.style.transform = `translate(${dx}px, ${dy}px) scale(.18)`;
    clone.style.opacity = '.15';
  });
  clone.addEventListener('transitionend', ()=> clone.remove(), {once:true});
}
function showToast(msg){
  let t = document.querySelector('.toastCart');
  if(!t){ t = document.createElement('div'); t.className='toastCart'; document.body.appendChild(t); }
  t.textContent = msg;
  requestAnimationFrame(()=> t.classList.add('show'));
  clearTimeout(t._h);
  t._h = setTimeout(()=> t.classList.remove('show'), 1800);
}
/* ==== Vaciar carrito ==== */
const clearCartBtn = document.getElementById('clearCartBtn');

clearCartBtn?.addEventListener('click', () => {
  localStorage.removeItem('gse_cart'); // borra todo el carrito
  updateCartBadge(); // contador vuelve a 0
  showToast("Carrito vaciado 🗑️");
});


/* ==== Tarjetas de catálogo: WhatsApp + Añadir ==== */
const catalogCards = document.querySelectorAll('#catalogo .catCard');
catalogCards.forEach(card => {
  card.setAttribute('tabindex','0');
  card.setAttribute('role','button');
  card.setAttribute('aria-pressed','false');

  if(!card.querySelector('.cardActions')){
    const actions = document.createElement('div');
    actions.className = 'cardActions';
    actions.innerHTML = `
      <button type="button" class="btnAction whats" data-action="whats">Cotizar por WhatsApp</button>
      <button type="button" class="btnAction add" data-action="add">Añadir al carrito</button>
    `;
    card.appendChild(actions);
  }
  function toggleSelect(){
    const sel = card.classList.toggle('selected');
    card.setAttribute('aria-pressed', sel);
  }
  card.addEventListener('click', (e)=>{
    if(e.target.closest('.btnAction') || e.target.closest('.cardLink')) return;
    toggleSelect();
  });
  card.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      toggleSelect();
    }
  });
});
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.btnAction');
  if(!btn) return;
  const card = btn.closest('.catCard');
  if(!card) return;

  const title = card.querySelector('h3')?.textContent.trim() || 'producto';
  const price = card.querySelector('span')?.textContent.trim() || '';
  const img = card.querySelector('img');
  const action = btn.dataset.action;

  if(action === 'whats'){
    const msg = encodeURIComponent(`Hola GSE, quiero cotizar: ${title} (${price}) ✨`);
    window.open(`https://wa.me/524428688377?text=${msg}`,'_blank');
  } else if(action === 'add'){
    btn.classList.add('added');
    const old = btn.textContent; btn.textContent = 'Añadido ✓';
    setTimeout(()=>{ btn.classList.remove('added'); btn.textContent = old; }, 1200);

    addToCart(title, { price, ts: Date.now() });
    showToast(`Añadido al carrito: ${title}`);
    flyToCart(img);
  }
});

/* ===== Newsletter + Cupón (Google Apps Script) ===== */
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

/* Handler genérico para botones de cupón (footer y sección #cupon) */
async function handleCouponRequest(emailInputId, buttonId, ui){
  const emailInput = document.getElementById(emailInputId);
  const btn = document.getElementById(buttonId);
  if(!emailInput || !btn) return;

  const email = emailInput.value.trim();
  if(!isValidEmail(email)){ alert('Por favor, ingresa un correo válido.'); emailInput.focus(); return; }

  const old = btn.textContent; btn.disabled = true; btn.textContent = "Enviando...";
  try{
    const { status, code } = await sendCoupon(email);
    const label = status === "existing"
      ? "¡Ya estabas suscrito! Reenviamos tu cupón:"
      : "¡Gracias por suscribirte! Aquí tu cupón:";
    alert(`${label}\n\n${code}`);

    // Actualiza UI opcional en #cupon
    if(ui?.msgEl) ui.msgEl.textContent = (status === "existing")
      ? `Cupón reenviado a ${email}: ${code}`
      : `Cupón enviado a ${email}: ${code}`;
    if(ui?.codeEl) ui.codeEl.textContent = code;

    emailInput.value = "";
  }catch(e){
    console.error(e);
    alert("Hubo un problema al enviar el cupón. Intenta más tarde.");
  }finally{
    btn.disabled = false; btn.textContent = old;
  }
}

/* Footer: "Seguir en shop" */
document.getElementById('btnSeguirShop')?.addEventListener('click', ()=>{
  handleCouponRequest('email','btnSeguirShop');
});

/* Sección #cupon: "Quiero mi cupón" (misma API) */
document.getElementById('btnCupon')?.addEventListener('click', ()=>{
  const ui = {
    msgEl: document.getElementById('cuponMsg'),
    codeEl: document.getElementById('cuponCode')
  };
  handleCouponRequest('cuponEmail','btnCupon', ui);
});

/* ==== Logo rotador (quieto 3s, gira y cambia) ==== */
(function(){
  const wrap = document.querySelector('.heroLogoWrap');
  if(!wrap) return;
  const img = wrap.querySelector('.heroLogo');
  if(!img) return;

  // Logos que se alternan
  const logos = ["logo original new.png", "logo original 2.png"];
  let idx = 0;

  setInterval(() => {
    // 1️⃣ después de 3 segundos: empieza giro
    img.classList.add("rotate");

    // 2️⃣ al terminar el giro (1s) cambiamos el logo
    setTimeout(() => {
      idx = (idx + 1) % logos.length;
      img.src = logos[idx];
      img.classList.remove("rotate");
    }, 1000); // duración del giro
  }, 4000); // cada ciclo dura 4s (3s quieto + 1s giro)
})();
