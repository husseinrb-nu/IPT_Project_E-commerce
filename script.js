/* ==========================================================
   TREADKICKS - script.js
   Comment style: each block starts with "Topic: description",
   where the topic names the concept being demonstrated.
   Short comments after // explain a single line.
   ========================================================== */

/* OOP, Inheritance: the parent class holds what every shoe shares, including the sale price. */
const SALE_PERCENT = 30, SALE_SECONDS = 60, WAIT_SECONDS = 120;  // 30% off; the sale lasts 1 minute (60 s), then 2 minutes (120 s) at the normal price before it starts again.
let saleActive = true;                           // true = sale price is showing, false = original price is showing.
class Product {
  constructor(id, name, price, image) { this.id = id; this.name = name; this.price = price; this.image = image; }
  get salePrice() { return Math.round(this.price * (1 - SALE_PERCENT / 100) / 5) * 5; } // A getter works like a property; rounded to the nearest 5.
  get currentPrice() { return saleActive ? this.salePrice : this.price; }   // The price the shopper pays right now.
  describe() { return this.name; }               // The child classes override this method.
}
/* OOP, extends and super(): each child class calls the parent constructor first. */
class MidTop extends Product {
  constructor(id, n, p, img) { super(id, n, p, img); this.category = "mid"; this.icon = "🏀"; }
  describe() { return `${this.name}: balanced support and speed`; }
}
class LowTop extends Product {
  constructor(id, n, p, img) { super(id, n, p, img); this.category = "low"; this.icon = "🏀"; }
  describe() { return `${this.name}: light and quick on the court`; }
}

/* Arrays: one array holds every child type, which is polymorphism in action.
   The PNG/JPG files live in the "images" folder next to index.html. To use a real photo, save it there
   with the same file name, or change the path below (.jpg and .png both work).
   Prices are demo prices. To add a shoe, copy one line and change the id, name, price and image path. */
const products = [
  new LowTop(1, "Kobe 8 What The", 11995, "images/kobe-8-what-the.jfif"),   new MidTop(2, "Book 1 Forrest Gump", 8495, "images/book-1-forrest-gump.jfif"),
  new LowTop(3, "Sabrina 3 USA", 7495, "images/sabrina-3-usa.jfif"),        new LowTop(4, "GT Cut 4 Kay Yow", 10995, "images/gt-cut-4-kay-yow.jfif"),
  new MidTop(5, "Harden Vol 8", 8495, "images/harden-8.jfif"),              new MidTop(6, "LeBron 20 Time Machine", 11495, "images/lebron-20-time-machine.jfif"),
  new LowTop(7, "Harden Vol 10 Clear Cyan", 8995, "images/harden-10-clear-cyan.jfif"), new LowTop(8, "Ja 3 Year of the Horse", 6495, "images/ja-3-year-of-the-horse.jfif")
];
const SIZES = [7, 8, 9, 10, 11, 12, 13];          // US sizes shown in each card's size menu.
const FREE_SHIP = 10000, SHIP_FEE = 250;           // Orders from ₱10,000 ship free, others pay ₱250.
const PROMOS = { TREAD10: { pct: 10, label: "10% off" }, HOOPS20: { pct: 20, label: "20% off" } }; // Valid promo codes.

/* Storage, helpers: one pair of functions reads and writes any saved value, and try/catch stops private mode from crashing the page. */
function load(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

let cart = load("tk_cart", []);                   // Each line is { id, size, qty }, so the same shoe in two sizes stays separate.
let wish = load("tk_wish", []);                   // The wishlist is a list of product ids.
let promo = load("tk_promo", null);               // The applied promo code, or null.
let addHistory = [];                              // The order lines were added in, so Undo knows the last one.
const money = (n) => "₱" + Math.round(n).toLocaleString();   // One formatter keeps every price looking the same.
const findProduct = (id) => products.find((p) => p.id === id);

/* DOM, selecting: the main elements are grabbed once and reused everywhere. */
const grid = document.querySelector("#productGrid");
const featured = document.querySelector("#featuredGrid");
const cartList = document.querySelector("#cartList");

/* Utility, setTimeout: the toast message hides itself after 2.5 seconds. */
function toast(message) {
  const t = document.querySelector("#toast");
  t.textContent = message;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500); // 2500 ms equals 2.5 seconds.
}

/* Images: the function shows the real photo, and swaps in an emoji if the file is missing so nothing breaks. */
function makePhoto(p, cls) {
  const img = document.createElement("img");
  img.src = p.image; img.alt = p.name; img.className = cls; img.loading = "lazy";
  img.addEventListener("error", () => {
    const f = document.createElement("span");
    f.className = cls + " fallback"; f.textContent = p.icon;
    img.replaceWith(f);
  });
  return img;
}

/* DOM, createElement: one product card is built in memory and then returned. */
function priceHTML(p) { return saleActive ? `<s>${money(p.price)}</s><b>${money(p.salePrice)}</b>` : `<b class="regular">${money(p.price)}</b>`; }
function createCard(p) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.id = p.id;                        // The data-id lets event delegation find the product.
  card.dataset.category = p.category;
  const badge = document.createElement("span");
  badge.className = "badge"; badge.textContent = `-${SALE_PERCENT}%`; badge.classList.toggle("hidden", !saleActive);
  const title = document.createElement("h3");
  title.textContent = p.name;
  const desc = document.createElement("p");
  desc.textContent = p.describe();               // Polymorphism: the same call gives different text per class.
  const price = document.createElement("p");
  price.className = "price";
  price.innerHTML = priceHTML(p);                // Old price crossed out and sale price in red during the sale; the normal price otherwise.
  const size = document.createElement("select");
  size.dataset.role = "size"; size.setAttribute("aria-label", "Size");
  SIZES.forEach((s) => size.add(new Option("US " + s, s)));
  const add = document.createElement("button");
  add.className = "btn"; add.dataset.action = "add"; add.textContent = "Add to cart";
  const heart = document.createElement("button");
  heart.className = "btn ghost"; heart.dataset.action = "wish"; heart.textContent = wish.includes(p.id) ? "♥" : "♡";
  const row = document.createElement("div");
  row.className = "row"; row.append(size, heart);
  card.append(badge, makePhoto(p, "photo"), title, desc, price, row, add);
  return card;
}
products.forEach((p) => grid.append(createCard(p)));
products.slice(0, 4).forEach((p) => featured.append(createCard(p)));   // slice(0, 4) takes the first four for Featured.

/* DOM, classList: the category filter, wishlist filter, search box and sort all work together. */
let activeFilter = "all";
function applyFilters() {
  const term = document.querySelector("#search").value.trim().toLowerCase();
  const sort = document.querySelector("#sort").value;
  const ranked = [...products];                  // A copy is sorted so the original order stays safe.
  if (sort === "low") ranked.sort((a, b) => a.currentPrice - b.currentPrice);
  if (sort === "high") ranked.sort((a, b) => b.currentPrice - a.currentPrice);
  if (sort === "az") ranked.sort((a, b) => a.name.localeCompare(b.name));
  let shown = 0;
  grid.querySelectorAll(".card").forEach((card) => {
    const id = Number(card.dataset.id);
    const name = card.querySelector("h3").textContent.toLowerCase();
    const okCat = activeFilter === "all" || card.dataset.category === activeFilter || (activeFilter === "wish" && wish.includes(id));
    const ok = okCat && name.includes(term);
    card.classList.toggle("hidden", !ok);
    card.style.order = ranked.findIndex((p) => p.id === id);     // CSS order rearranges the cards without rebuilding them.
    if (ok) shown++;
  });
  document.querySelectorAll("[data-filter]").forEach((b) => b.classList.toggle("on", b.dataset.filter === activeFilter));
  document.querySelector("#shopNote").textContent = shown ? `Showing ${shown} pair${shown > 1 ? "s" : ""}.` : "No shoes match. Try another search or filter.";
}
document.querySelectorAll("[data-filter]").forEach((btn) =>
  btn.addEventListener("click", () => { activeFilter = btn.dataset.filter; applyFilters(); }));
document.querySelector("#search").addEventListener("input", applyFilters); // The search updates live while typing.
document.querySelector("#sort").addEventListener("change", applyFilters);
document.querySelectorAll("[data-pick]").forEach((btn) => btn.addEventListener("click", () => {  // Category tiles filter the shop, then scroll to it.
  activeFilter = btn.dataset.pick; applyFilters(); location.hash = "#shop";
}));

/* Events, capturing: the third argument true makes this listener run first, from parent to child.
   The flow is only written to the console now, so shoppers never see technical words on the page. */
[grid, featured].forEach((g) => g.addEventListener("click", () => console.log("1. Capturing: grid saw the click first"), true));

/* Events, delegation and bubbling: one listener per grid serves every card. */
function onGridClick(e) {
  const card = e.target.closest(".card");        // closest() still works when an inner element is clicked.
  if (!card) return;
  console.log(`2. Bubbling: target=${e.target.tagName}, currentTarget=${e.currentTarget.id}`);
  const action = e.target.dataset.action;
  const id = Number(card.dataset.id);
  if (action === "add") addToCart(id, Number(card.querySelector("[data-role=size]").value));
  else if (action === "wish") { e.stopPropagation(); toggleWish(id); }   // Events, stopPropagation: the heart click stops here.
  else if (e.target.tagName !== "SELECT") card.classList.toggle("selected");
}
grid.addEventListener("click", onGridClick);
featured.addEventListener("click", onGridClick);

/* Arrays, push and find: the chosen product is added to the cart, or its quantity goes up if that size is already there. */
function addToCart(id, size) {
  const line = cart.find((l) => l.id === id && l.size === size);
  if (line) line.qty++; else cart.push({ id, size, qty: 1 });
  addHistory.push({ id, size });                 // push remembers the add so Undo can reverse it.
  renderCart();
  toast(`${findProduct(id).name} (US ${size}) added!`);
}
/* Arrays, pop: the last add is reversed, so one pair of that size is taken out. */
document.querySelector("#undoBtn").addEventListener("click", () => {
  const last = addHistory.pop();
  if (!last) return toast("Nothing to undo");
  changeQty(last.id, last.size, -1);
});
document.querySelector("#clearBtn").addEventListener("click", () => { cart = []; addHistory = []; renderCart(); });
function changeQty(id, size, delta) {
  const line = cart.find((l) => l.id === id && l.size === size);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) cart.splice(cart.indexOf(line), 1);   // splice removes the line when the quantity hits zero.
  renderCart();
}

/* Cart, totals: subtotal, promo discount, shipping and total are worked out in one place. */
function totals() {
  const subtotal = cart.reduce((sum, l) => sum + findProduct(l.id).currentPrice * l.qty, 0);   // The current price is used (sale or original).
  const discount = promo ? subtotal * promo.pct / 100 : 0;
  const shipping = cart.length === 0 || subtotal - discount >= FREE_SHIP ? 0 : SHIP_FEE;
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}

/* DOM, render: the cart list and the totals are rebuilt from the cart array, then saved. */
function renderCart() {
  cartList.innerHTML = "";
  cart.forEach((l) => {
    const p = findProduct(l.id);
    const li = document.createElement("li");
    li.dataset.id = l.id; li.dataset.size = l.size;
    const label = document.createElement("span");
    label.append(makePhoto(p, "thumb"), `${p.name} · US ${l.size} · ${money(p.currentPrice)}`);
    const qty = document.createElement("span");
    qty.className = "qty";
    qty.innerHTML = `<button class="btn ghost" data-action="minus" aria-label="Less">−</button><b>${l.qty}</b><button class="btn ghost" data-action="plus" aria-label="More">+</button><button class="btn ghost" data-action="remove">Remove</button>`;
    li.append(label, qty);
    cartList.append(li);
  });
  if (cart.length === 0) { const li = document.createElement("li"); li.textContent = "Your cart is empty."; cartList.append(li); }
  const t = totals();
  document.querySelector("#sSub").textContent = money(t.subtotal);
  document.querySelector("#sDisc").textContent = "-" + money(t.discount);
  document.querySelector("#sShip").textContent = t.shipping ? money(t.shipping) : "FREE";
  document.querySelector("#cartTotal").textContent = money(t.total);
  document.querySelector("#cartCount").textContent = cart.reduce((n, l) => n + l.qty, 0);   // The badge counts pairs, not lines.
  save("tk_cart", cart);                          // Saved every time, so a refresh keeps the cart.
}

/* Events, delegation: one listener on the cart handles every +, − and Remove button. */
cartList.addEventListener("click", (e) => {
  const action = e.target.dataset.action, li = e.target.closest("li");
  if (!action || !li) return;
  const id = Number(li.dataset.id), size = Number(li.dataset.size);
  if (action === "plus") changeQty(id, size, 1);
  if (action === "minus") changeQty(id, size, -1);
  if (action === "remove") changeQty(id, size, -999);   // A big negative number empties the line.
});

/* Promo, codes: the typed code is matched (ignoring case) against the PROMOS list. */
function showPromo() {
  const m = document.querySelector("#promoMsg");
  m.textContent = promo ? `${promo.code} applied: ${promo.label}` : "Try TREAD10"; m.className = promo ? "good" : "note";
}
document.querySelector("#promoBtn").addEventListener("click", () => {
  const code = document.querySelector("#promoIn").value.trim().toUpperCase();
  if (PROMOS[code]) { promo = { code, ...PROMOS[code] }; save("tk_promo", promo); showPromo(); renderCart(); }
  else { promo = null; save("tk_promo", null); showPromo(); renderCart(); toast("That code is not valid"); }
});

/* HTTP, helper: one function handles every request and checks response.ok. */
const API = "https://jsonplaceholder.typicode.com";
async function requestJSON(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error("HTTP " + response.status); // fetch does not throw on a 404, so the check is manual.
  if (response.status === 204) return null;
  return response.json();
}

/* HTTP, PATCH: the wishlist heart saves locally first, then sends a partial update to the demo server. */
async function toggleWish(id) {
  wish = wish.includes(id) ? wish.filter((w) => w !== id) : [...wish, id];   // filter removes, the spread adds.
  save("tk_wish", wish);
  document.querySelectorAll(`.card[data-id="${id}"] [data-action=wish]`).forEach((b) => { b.textContent = wish.includes(id) ? "♥" : "♡"; });
  document.querySelector("#wishCount").textContent = wish.length;
  applyFilters();                                // The wishlist filter updates straight away.
  try {
    await requestJSON(API + "/posts/1", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "wishlist" }) });
  } catch (err) { console.log("Demo server unreachable, wishlist kept locally:", err.message); }
}

/* Forms, helpers: shared feedback functions change classes, and the CSS does the styling. */
function showError(input, msgEl, text) {
  msgEl.textContent = text; msgEl.className = "err";
  input.classList.remove("valid"); input.classList.add("invalid");
}
function showValid(input, msgEl) {
  msgEl.textContent = "Looks good."; msgEl.className = "good";
  input.classList.remove("invalid"); input.classList.add("valid");
}
function required(input, msgEl, label) {
  if (input.value.trim() === "") { showError(input, msgEl, label + " is required."); return false; } // trim() ignores spaces.
  showValid(input, msgEl); return true;
}

/* Auth, storage: accounts live in localStorage. This is demo only, since real sites verify on a server. */
let currentUser = null;                          // null means nobody is signed in.
try { currentUser = JSON.parse(localStorage.getItem("tk_session") || sessionStorage.getItem("tk_session")); } catch {}

/* Orders, storage: every bought order is saved with the buyer's email, so each account sees only its own. */
const myOrders = () => currentUser ? load("tk_orders", []).filter((o) => o.email === currentUser.email) : [];

/* Orders, stages: STAGE_MS is how long each step takes to be reached, and 0 means done at purchase.
   Changing a number speeds up or slows down the tracking demo. */
const STAGES = ["Order placed", "Packed", "Shipped", "Out for delivery", "Delivered"];
const STAGE_MS = [0, 3000, 4000, 3000, 3000];
const TOTAL_MS = STAGE_MS.reduce((a, b) => a + b, 0);   // reduce adds every step together, giving 13000 ms.

/* Orders, buying: checkout calls this to turn the cart into a saved order for the signed-in user. */
function createOrder(payment) {
  const t = totals();
  const order = {
    id: "TK-" + Date.now().toString().slice(-6),         // The last 6 digits of the clock make a unique-enough id.
    email: currentUser.email, payment,
    items: cart.map((l) => ({ ...l })),                   // A copy of each line (id, size, qty); the products array gives the name and photo later.
    total: t.total, stage: 0                              // Stage 0 is "Order placed".
  };
  const all = load("tk_orders", []); all.unshift(order);  // unshift puts the newest order on top.
  save("tk_orders", all);
  return order;
}

/* Orders, render: the order boxes are built from storage, and paintOrder() fills in the tracking numbers. */
const orderList = document.querySelector("#orderList");
function renderOrders() {
  orderList.innerHTML = "";
  if (!currentUser) { orderList.innerHTML = '<p class="note">Sign in to see and track your orders.</p>'; return; }
  const mine = myOrders();
  if (mine.length === 0) { orderList.innerHTML = '<p class="note">No orders yet. Add a pair and place an order.</p>'; return; }
  mine.forEach((o) => {
    const box = document.createElement("div");
    box.className = "order"; box.dataset.order = o.id;
    const head = document.createElement("div");
    head.className = "order-head";
    head.innerHTML = `<strong>Order ${o.id} · ${o.payment || "Cash on delivery"}</strong><span class="price">${money(o.total)}</span>`;
    const items = document.createElement("div");
    items.className = "order-items";
    o.items.forEach((l) => {
      const p = findProduct(l.id);
      const row = document.createElement("div");
      row.append(makePhoto(p, "thumb"), `${p.name} · US ${l.size} × ${l.qty}`);   // append() with plain text is safe.
      items.append(row);
    });
    const stages = document.createElement("div");
    stages.className = "stages";
    STAGES.forEach((s) => { const chip = document.createElement("span"); chip.className = "stage"; chip.textContent = s; stages.append(chip); });
    const bar = document.createElement("div");
    bar.className = "bar"; bar.innerHTML = '<div class="fill"></div>';
    const nums = document.createElement("div");
    nums.className = "track-nums";
    nums.innerHTML = '<span class="pct">0%</span><span class="left"></span>';
    const btn = document.createElement("button");
    btn.className = "btn"; btn.dataset.action = "track"; btn.textContent = "Track order";
    box.append(head, items, stages, bar, nums, btn);
    orderList.append(box);
    paintOrder(o.id, o.stage, 0);                         // The saved progress is shown straight away.
  });
}

/* Orders, painting: this updates one order box, including the stage chips, bar width, percent and seconds left.
   The elapsed value is how many ms of the current step have passed, which makes the numbers move smoothly. */
function paintOrder(id, stage, elapsed) {
  const box = document.querySelector(`[data-order="${id}"]`);
  if (!box) return;                                       // The box may be gone if the user signed out.
  let done = 0;
  for (let i = 1; i <= stage; i++) done += STAGE_MS[i];   // The time of the steps already finished.
  const delivered = stage === STAGES.length - 1;
  const pct = delivered ? 100 : Math.min(100, Math.round(((done + elapsed) / TOTAL_MS) * 100));
  const left = delivered ? 0 : Math.max(0, TOTAL_MS - done - elapsed);
  box.querySelectorAll(".stage").forEach((chip, i) => chip.classList.toggle("on", i <= stage));
  const fill = box.querySelector(".fill");
  fill.style.width = pct + "%"; fill.classList.toggle("done", delivered);
  box.querySelector(".pct").textContent = pct + "%  ·  " + STAGES[stage];
  box.querySelector(".left").textContent = delivered ? "Delivered ✔" : `Arrives in ${(left / 1000).toFixed(1)}s`;
  const btn = box.querySelector("[data-action=track]");
  if (delivered) { btn.disabled = true; btn.textContent = "Delivered"; }
}

/* Async, Promise and setInterval: the function waits for the given ms and ticks every 100 ms so the numbers can update.
   resolve() means the wait finished, and reject() means the user cancelled through the AbortController signal. */
function waitStep(ms, onTick, signal) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.min(Date.now() - start, ms);
      onTick(elapsed);
      if (elapsed >= ms) { clearInterval(timer); resolve(); }   // The repeat stops first, then the promise finishes.
    }, 100);
    signal.addEventListener("abort", () => { clearInterval(timer); reject(new DOMException("Cancelled", "AbortError")); });
  });
}

/* Async, async/await loop: the function goes through each remaining stage one after another and saves the progress. */
const trackers = {};                                      // Maps an order id to the AbortController of its running track.
async function trackOrder(id) {
  const order = load("tk_orders", []).find((o) => o.id === id);
  const box = document.querySelector(`[data-order="${id}"]`);
  const btn = box.querySelector("[data-action=track]");
  const controller = new AbortController();
  trackers[id] = controller;
  btn.textContent = "Cancel tracking";
  try {
    for (let i = order.stage + 1; i < STAGES.length; i++) {
      await waitStep(STAGE_MS[i], (elapsed) => paintOrder(id, i - 1, elapsed), controller.signal); // await pauses the loop until the step ends.
      const all = load("tk_orders", []);                  // The orders are reloaded first so an order placed meanwhile is not lost.
      all.find((o) => o.id === id).stage = i;             // The reached step is saved so a refresh keeps it.
      save("tk_orders", all);
      paintOrder(id, i, 0);
      toast(`${id}: ${STAGES[i]}`);
    }
  } catch (err) {
    if (err.name === "AbortError") toast("Tracking cancelled");
    else toast("Tracking failed: " + err.message);
    btn.textContent = "Track order";
  } finally { delete trackers[id]; }                      // finally always frees the slot.
}

/* Events, delegation: one listener on the order list handles every Track and Cancel button. */
orderList.addEventListener("click", (e) => {
  if (e.target.dataset.action !== "track") return;
  const id = e.target.closest(".order").dataset.order;
  if (trackers[id]) trackers[id].abort();                 // If tracking is already running, the click cancels it.
  else trackOrder(id);
});

/* Forms and HTTP, POST: checkout validates the form, sends JSON, then saves the order so it can be tracked. */
const cName = document.querySelector("#cName"), cEmail = document.querySelector("#cEmail"), cAddr = document.querySelector("#cAddr");
const nameErr = document.querySelector("#cNameErr"), emailErr2 = document.querySelector("#cEmailErr"), addrErr = document.querySelector("#cAddrErr");
cName.addEventListener("input", () => required(cName, nameErr, "Name"));    // The input event gives live feedback.
cAddr.addEventListener("blur", () => required(cAddr, addrErr, "Address"));  // The blur event checks after the user leaves the field.
function checkEmail(input, msgEl) {
  const v = input.value.trim();
  if (v === "") { showError(input, msgEl, "Email is required."); return false; }
  if (!/^\S+@\S+\.\S+$/.test(v)) { showError(input, msgEl, "Enter a valid email like name@mail.com."); return false; }   // A regular expression checks the shape.
  showValid(input, msgEl); return true;
}
cEmail.addEventListener("input", () => checkEmail(cEmail, emailErr2));

document.querySelector("#checkoutForm").addEventListener("submit", async (e) => {
  e.preventDefault();                            // This stops the page from reloading.
  const ok = [required(cName, nameErr, "Name"), checkEmail(cEmail, emailErr2), required(cAddr, addrErr, "Address")];
  const status = document.querySelector("#orderStatus"), btn = document.querySelector("#payBtn");
  if (ok.includes(false)) return;
  if (!currentUser) { status.className = "err"; status.textContent = "Please sign in first."; location.hash = "#login"; return; }
  if (cart.length === 0) { status.className = "err"; status.textContent = "Add a pair first."; return; }
  btn.disabled = true; status.className = "note"; status.textContent = "Placing order...";
  const payment = document.querySelector("#cPay").value;
  try {
    await requestJSON(API + "/posts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer: cName.value.trim(), items: cart.map((l) => findProduct(l.id).name) }) // The object is turned into a JSON string.
    });
  } catch (err) { console.log("Demo server unreachable, order saved locally:", err.message); } // The order still goes through when offline.
  const order = createOrder(payment);            // The cart is now bought and saved under this account.
  status.className = "good"; status.textContent = `Order placed! ID: ${order.id}`;
  cart = []; addHistory = []; promo = null; save("tk_promo", null); showPromo();
  renderCart(); renderOrders(); e.target.reset();
  updateAuthUI();                                // reset() cleared the form, so the name and email are filled in again.
  location.hash = "#orders";                     // The page moves straight to My Orders.
  trackOrder(order.id);                          // Tracking starts automatically, so setInterval begins ticking.
  btn.disabled = false;
});

/* Async, Promise: a fake server where sign up saves a user and sign in checks the email and password. */
function authRequest(mode, name, mail, pass) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = load("tk_users", []);
      const found = users.find((u) => u.email === mail);
      if (mode === "up") {
        if (found) return reject("That email is already registered.");
        const user = { name, email: mail, password: pass };
        users.push(user); save("tk_users", users); resolve(user);
      } else {
        if (!found) return reject("No account found. Create one first.");
        if (found.password !== pass) return reject("Wrong password.");
        resolve(found);
      }
    }, 1000);
  });
}

/* Auth, UI: the nav button, the checkout prefill and My Orders all follow the signed-in state. */
const authBtn = document.querySelector("#authBtn");
function updateAuthUI() {
  authBtn.textContent = currentUser ? `Hi, ${currentUser.name} · Logout` : "Sign In";
  if (currentUser) { cName.value = currentUser.name; cEmail.value = currentUser.email; }
  renderOrders();                                // This shows the account's orders, or the sign-in note.
}
authBtn.addEventListener("click", () => {
  if (currentUser) {                             // Logging out clears both storages.
    Object.values(trackers).forEach((c) => c.abort()); // Any tracking still running is stopped.
    currentUser = null;
    try { localStorage.removeItem("tk_session"); sessionStorage.removeItem("tk_session"); } catch {}
    updateAuthUI(); toast("Signed out");
  } else { location.hash = "#login"; }
});

/* Auth, modes: one form with two modes, where "in" is sign in and "up" is create account. */
let mode = "in";
const uName = document.querySelector("#uName");
function setMode(m) {
  mode = m;
  document.querySelector("#nameRow").classList.toggle("hidden", m === "in");
  document.querySelector("#authTitle").textContent = m === "in" ? "Sign In" : "Create Account";
  document.querySelector("#loginBtn").textContent = m === "in" ? "Sign in" : "Create account";
}
document.querySelector("#modeIn").addEventListener("click", () => setMode("in"));
document.querySelector("#modeUp").addEventListener("click", () => setMode("up"));

/* Forms, login validation: the email and password are checked as the user types. */
const email = document.querySelector("#email"), password = document.querySelector("#password");
function vEmail() { return checkEmail(email, document.querySelector("#emailErr")); }
function vPass() {
  const m = document.querySelector("#passErr");
  if (password.value === "") { showError(password, m, "Password is required."); return false; }
  if (password.value.length < 6) { showError(password, m, "Password must have at least 6 characters."); return false; }
  showValid(password, m); return true;
}
email.addEventListener("input", vEmail); password.addEventListener("input", vPass);
document.querySelector("#showPass").addEventListener("change", (e) => { password.type = e.target.checked ? "text" : "password"; });

/* Async, async/await and try/catch: submitting the form signs in or creates the account. */
document.querySelector("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nameOK = mode === "up" ? required(uName, document.querySelector("#uNameErr"), "Name") : true;
  const emailOK = vEmail(), passOK = vPass();    // All checks run so every error shows at once.
  if (!(nameOK && emailOK && passOK)) return;
  const out = document.querySelector("#loginOut"), btn = document.querySelector("#loginBtn");
  btn.disabled = true; out.className = "note"; out.textContent = "Checking...";
  try {
    const user = await authRequest(mode, uName.value.trim(), email.value.trim().toLowerCase(), password.value);
    if (mode === "up") {
      out.className = "good"; out.textContent = "Account created! Now sign in.";
      setMode("in");
    } else {
      currentUser = { name: user.name, email: user.email };
      const remember = document.querySelector("#remember").checked; // When checked, the session stays after the tab closes.
      try { (remember ? localStorage : sessionStorage).setItem("tk_session", JSON.stringify(currentUser)); } catch {}
      updateAuthUI();
      out.className = "good"; out.textContent = `Login successful! Welcome, ${user.name}.` + (remember ? " Remember Me is ON." : "");
      location.hash = "#shop";                   // The shopper is sent to the shoes after signing in.
    }
  } catch (err) { out.className = "err"; out.textContent = err; }
  finally { btn.disabled = false; }
});

/* Reviews, rendering: shoppers' own reviews (saved locally) and loaded ones share one list-building function. */
const statusEl = document.querySelector("#status"), reviewList = document.querySelector("#reviewList"), loadBtn = document.querySelector("#loadBtn");
function addReview(who, text, stars) {
  const li = document.createElement("li");
  const s = document.createElement("span");
  s.className = "stars"; s.textContent = "★".repeat(stars) + "☆".repeat(5 - stars);
  li.append(s, ` ${who}: ${text}`);               // textContent/append keeps text safe, even when it comes from an API or a user.
  reviewList.prepend(li);
}
load("tk_reviews", []).forEach((r) => addReview(r.who, r.text, r.stars));   // Saved reviews come back after a refresh.
document.querySelector("#reviewForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = document.querySelector("#rText").value.trim();
  if (!text) return toast("Write something first");
  const r = { who: currentUser ? currentUser.name : "Guest", text, stars: Number(document.querySelector("#rStars").value) };
  const all = load("tk_reviews", []); all.push(r); save("tk_reviews", all);
  addReview(r.who, r.text, r.stars); e.target.reset(); toast("Thanks for your review!");
});

/* HTTP, GET and query string: more reviews are loaded and shown safely. */
loadBtn.addEventListener("click", async () => {
  loadBtn.disabled = true;                       // This prevents duplicate clicks.
  try {
    statusEl.textContent = "Loading reviews...";
    const params = new URLSearchParams({ _limit: "3" });
    const reviews = await requestJSON(API + "/comments?" + params);
    reviews.forEach((r) => addReview(r.email, r.name, 4 + (r.id % 2)));   // The API has no stars, so 4 or 5 are used.
    statusEl.textContent = "Reviews loaded.";
  } catch (err) { statusEl.textContent = "Could not load reviews. Check your connection."; console.log(err.message); }
  finally { loadBtn.disabled = false; }
});

/* Async, setInterval: the sale runs for 1 minute, then prices go back to normal for 2 minutes, then the sale starts again.
   Every element with the class saleTime shows the same clock, and the bar shows how much of the current phase is left. */
let secondsLeft = SALE_SECONDS;
document.querySelector("#salePct").textContent = SALE_PERCENT;
const saleBar = document.querySelector(".salebar"), saleLabel = document.querySelector("#saleLabel");
function refreshPrices() {                       // Redraws every price, badge, the cart and the sort order for the current phase.
  document.querySelectorAll(".card").forEach((card) => {
    const p = findProduct(Number(card.dataset.id));
    card.querySelector(".price").innerHTML = priceHTML(p);
    card.querySelector(".badge").classList.toggle("hidden", !saleActive);
  });
  renderCart(); applyFilters();
}
function paintSale() {
  const m = String(Math.floor(secondsLeft / 60)).padStart(2, "0"), s = String(secondsLeft % 60).padStart(2, "0");
  document.querySelectorAll(".saleTime").forEach((el) => { el.textContent = `${m}:${s}`; });
  const total = saleActive ? SALE_SECONDS : WAIT_SECONDS;
  document.querySelector("#saleFill").style.width = (saleActive ? secondsLeft / total : 1 - secondsLeft / total) * 100 + "%";   // Shrinks during the sale, fills up while waiting.
  saleBar.innerHTML = saleActive
    ? `🔥 FLASH SALE · ${SALE_PERCENT}% OFF every pair · ends in <b class="saleTime">${m}:${s}</b>`
    : `⏳ Sale over · prices are back to normal · sale starts again in <b class="saleTime">${m}:${s}</b>`;
  saleLabel.innerHTML = saleActive ? `⚡ Sale ends in <span class="saleTime">${m}:${s}</span>` : `⏳ Next sale in <span class="saleTime">${m}:${s}</span>`;
}
setInterval(() => {
  secondsLeft--;
  if (secondsLeft < 0) {                         // The phase is over, so switch between sale and normal price.
    saleActive = !saleActive;
    secondsLeft = saleActive ? SALE_SECONDS : WAIT_SECONDS;
    refreshPrices();
    toast(saleActive ? "🔥 The sale has started! Everything is " + SALE_PERCENT + "% off for 1 minute." : "⏰ The sale has ended. Prices are back to normal.");
  }
  paintSale();
}, 1000);
paintSale();

/* Startup: everything saved from last time is drawn when the page opens. */
document.querySelector("#wishCount").textContent = wish.length;
showPromo(); renderCart(); applyFilters(); updateAuthUI();
