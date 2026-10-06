/* ==========================================================
   TREADKICKS · script.js
   Comment key:  ▶ [TOPIC] = what this block does
                 ✎ = why / reminder
                 ★ = NEW in this version (orders + tracking)
   ========================================================== */

/* ▶ [OOP · INHERITANCE] Parent class holds what every shoe shares */
class Product {
  constructor(id, name, price, image) { this.id = id; this.name = name; this.price = price; this.image = image; }
  describe() { return this.name; }              // ✎ children override this
}
/* ▶ [OOP · extends + super()] each child calls the parent constructor first */
class Sneaker extends Product {
  constructor(id, n, p, img) { super(id, n, p, img); this.category = "sneaker"; this.icon = "👟"; }
  describe() { return `${this.name}: lightweight, built for speed`; }
}
class Boot extends Product {
  constructor(id, n, p, img) { super(id, n, p, img); this.category = "boot"; this.icon = "🥾"; }
  describe() { return `${this.name}: rugged, ready for any trail`; }
}
class Sandal extends Product {
  constructor(id, n, p, img) { super(id, n, p, img); this.category = "sandal"; this.icon = "🩴"; }
  describe() { return `${this.name}: breezy comfort for summer`; }
}

/* ▶ [ARRAYS] one array holds all child types (polymorphism in action) */
/* ✎ PUT YOUR JPGs in an "images" folder next to index.html and match the file names below */
/* ✎ to add a shoe: copy one line, change id / name / price / jpg path */
const products = [
  new Sneaker(1, "AirStride Runner", 4500, "images/airstride.jpg"), new Sneaker(2, "Court Classic", 3800, "images/court-classic.jpg"),
  new Boot(3, "Trail Boss", 5200, "images/trail-boss.jpg"),          new Boot(4, "Urban Chelsea", 4900, "images/urban-chelsea.jpg"),
  new Sandal(5, "Breeze Slide", 1500, "images/breeze-slide.jpg"),    new Sandal(6, "Sunwalk", 1800, "images/sunwalk.jpg")
];
let cart = [];                                   // ✎ items added by the customer

/* ▶ [DOM · SELECT] grab elements once, reuse everywhere */
const grid = document.querySelector("#productGrid");
const cartList = document.querySelector("#cartList");
const eventLog = document.querySelector("#eventLog");

/* ▶ [UTILITY · setTimeout] toast hides itself after 2.5 seconds */
function toast(message) {
  const t = document.querySelector("#toast");
  t.textContent = message;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500); // ✎ 2500 ms = 2.5 s
}

/* ▶ [IMAGES] real JPG photo; if the file is missing, swap in the emoji so nothing breaks */
function makePhoto(p, cls) {
  const img = document.createElement("img");
  img.src = p.image; img.alt = p.name; img.className = cls;
  img.addEventListener("error", () => {
    const f = document.createElement("span");
    f.className = cls + " fallback"; f.textContent = p.icon;
    img.replaceWith(f);
  });
  return img;
}

/* ▶ [DOM · createElement] build one product card in memory, then return it */
function createCard(p) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.id = p.id;                        // ✎ data-id lets delegation find the product
  card.dataset.category = p.category;
  const icon = makePhoto(p, "photo");
  const title = document.createElement("h3");
  title.textContent = p.name;
  const desc = document.createElement("p");
  desc.textContent = p.describe();               // ✎ polymorphism: same call, different text
  const price = document.createElement("p");
  price.classList.add("price"); price.textContent = "₱" + p.price.toLocaleString();
  const add = document.createElement("button");
  add.className = "btn"; add.dataset.action = "add"; add.textContent = "Add to cart";
  const heart = document.createElement("button");
  heart.className = "btn ghost"; heart.dataset.action = "wish"; heart.textContent = "♡";
  card.append(icon, title, desc, price, add, heart);
  return card;
}
products.forEach((p) => grid.append(createCard(p)));

/* ▶ [DOM · classList] filter + search both toggle the "hidden" class */
let activeFilter = "all";
function applyFilters() {
  const term = document.querySelector("#search").value.trim().toLowerCase();
  document.querySelectorAll("#productGrid .card").forEach((card) => {
    const name = card.querySelector("h3").textContent.toLowerCase();
    const okCat = activeFilter === "all" || card.dataset.category === activeFilter;
    card.classList.toggle("hidden", !(okCat && name.includes(term)));
  });
}
document.querySelectorAll("[data-filter]").forEach((btn) =>
  btn.addEventListener("click", () => { activeFilter = btn.dataset.filter; applyFilters(); }));
document.querySelector("#search").addEventListener("input", applyFilters); // ✎ live search

/* ▶ [EVENTS · CAPTURING] third argument true = runs first, parent to child */
grid.addEventListener("click", () => {
  eventLog.textContent = "1. Capturing: grid saw the click first\n";
}, true);

/* ▶ [EVENTS · DELEGATION + BUBBLING] ONE listener on the grid serves every card */
grid.addEventListener("click", (e) => {
  const card = e.target.closest(".card");        // ✎ closest() works even on inner clicks
  if (!card) return;
  eventLog.textContent += `2. Bubbling: target=${e.target.tagName}, currentTarget=${e.currentTarget.id}`;
  const action = e.target.dataset.action;
  if (action === "add") addToCart(Number(card.dataset.id));
  else if (action === "wish") toggleWish(e.target);
  else card.classList.toggle("selected");
});
/* ▶ [EVENTS · stopPropagation] wishlist clicks must not reach the document */
document.addEventListener("click", (e) => {
  if (e.target.dataset.action === "wish") console.log("This should never print for ♡");
});
grid.addEventListener("click", (e) => { if (e.target.dataset.action === "wish") e.stopPropagation(); });

/* ▶ [ARRAYS · push] add the chosen product to the cart array */
function addToCart(id) {
  const product = products.find((p) => p.id === id);
  cart.push(product);
  renderCart();
  toast(product.name + " added!");
}
/* ▶ [ARRAYS · pop] remove the LAST item added */
document.querySelector("#undoBtn").addEventListener("click", () => {
  const removed = cart.pop();
  console.log("Removed:", removed, "Updated cart:", cart);
  renderCart();
});

/* ▶ [DOM · render] rebuild the cart list and totals from the array */
function renderCart() {
  cartList.innerHTML = "";
  cart.forEach((p, index) => {
    const li = document.createElement("li");
    li.dataset.index = index;
    const label = document.createElement("span");
    label.append(makePhoto(p, "thumb"), `${p.name} · ₱${p.price.toLocaleString()}`);
    const del = document.createElement("button");
    del.className = "btn ghost"; del.dataset.action = "remove"; del.textContent = "Remove";
    li.append(label, del);
    cartList.append(li);
  });
  if (cart.length === 0) {                       // ✎ empty state message
    const li = document.createElement("li"); li.textContent = "Your cart is empty."; cartList.append(li);
  }
  let total = 0;
  cart.forEach((p) => { total += p.price; });
  document.querySelector("#cartTotal").textContent = "₱" + total.toLocaleString();
  document.querySelector("#cartCount").textContent = cart.length;
}
renderCart();

/* ▶ [HTTP · HELPER] one function for every request; checks response.ok */
const API = "https://jsonplaceholder.typicode.com";
async function requestJSON(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error("HTTP " + response.status); // ✎ fetch doesn't throw on 404
  if (response.status === 204) return null;
  return response.json();
}

/* ▶ [HTTP · PATCH] wishlist heart saves a partial update, then swaps the symbol */
async function toggleWish(btn) {
  try {
    await requestJSON(API + "/posts/1", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "wishlist" })
    });
    const next = document.createElement("button");     // ✎ replaceWith swaps the old element
    next.className = "btn ghost"; next.dataset.action = "wish";
    next.textContent = btn.textContent === "♡" ? "♥" : "♡";
    btn.replaceWith(next);
  } catch (err) { toast("Wishlist failed: " + err.message); }
}
/* ▶ [HTTP · DELETE + DOM remove] remove from the page ONLY after the server confirms */
cartList.addEventListener("click", async (e) => {
  if (e.target.dataset.action !== "remove") return;
  const li = e.target.closest("li");
  try {
    await requestJSON(API + "/posts/1", { method: "DELETE" });
    cart.splice(Number(li.dataset.index), 1);
    renderCart();
  } catch (err) { toast("Remove failed: " + err.message); }
});

/* ▶ [FORMS · helpers] shared feedback functions (class changes, CSS does the styling) */
function showError(input, msgEl, text) {
  msgEl.textContent = text; msgEl.className = "err";
  input.classList.remove("valid"); input.classList.add("invalid");
}
function showValid(input, msgEl) {
  msgEl.textContent = "Looks good."; msgEl.className = "good";
  input.classList.remove("invalid"); input.classList.add("valid");
}
function required(input, msgEl, label) {
  if (input.value.trim() === "") { showError(input, msgEl, label + " is required."); return false; } // ✎ trim() ignores spaces
  showValid(input, msgEl); return true;
}

/* ▶ [AUTH · storage] accounts live in localStorage (demo only: real sites verify on a server) */
function loadUsers() { try { return JSON.parse(localStorage.getItem("tk_users")) || []; } catch { return []; } }
function saveUsers(list) { try { localStorage.setItem("tk_users", JSON.stringify(list)); } catch {} }
let currentUser = null;                          // ✎ null = signed out
try { currentUser = JSON.parse(localStorage.getItem("tk_session") || sessionStorage.getItem("tk_session")); } catch {}

/* ★ [ORDERS · storage] every bought order is saved with the buyer's email, so each account sees only its own */
function loadOrders() { try { return JSON.parse(localStorage.getItem("tk_orders")) || []; } catch { return []; } }
function saveOrders(list) { try { localStorage.setItem("tk_orders", JSON.stringify(list)); } catch {} }
function myOrders() { return currentUser ? loadOrders().filter((o) => o.email === currentUser.email) : []; }

/* ★ [ORDERS · stages] how long (ms) each step takes to be reached; 0 = already done at purchase */
/* ✎ change a number to speed up or slow down the tracking demo */
const STAGES = ["Order placed", "Packed", "Shipped", "Out for delivery", "Delivered"];
const STAGE_MS = [0, 3000, 4000, 3000, 3000];
const TOTAL_MS = STAGE_MS.reduce((a, b) => a + b, 0);   // ✎ reduce adds every step up = 13000 ms

/* ★ [ORDERS · buy] checkout calls this: turns the cart into a saved order for the signed-in user */
function createOrder() {
  const order = {
    id: "TK-" + Date.now().toString().slice(-6),         // ✎ last 6 digits of the clock = a unique-enough id
    email: currentUser.email,
    items: cart.map((p) => p.id),                         // ✎ store ids only; products[] gives name + photo later
    total: cart.reduce((sum, p) => sum + p.price, 0),
    stage: 0                                              // ✎ 0 = "Order placed"
  };
  const all = loadOrders(); all.unshift(order);           // ✎ unshift = newest order on top
  saveOrders(all);
  return order;
}

/* ★ [ORDERS · render] build the order boxes from storage; tracking numbers are painted by paintOrder() */
const orderList = document.querySelector("#orderList");
function renderOrders() {
  orderList.innerHTML = "";
  if (!currentUser) { orderList.innerHTML = '<p class="note">Sign in to see and track your orders.</p>'; return; }
  const mine = myOrders();
  if (mine.length === 0) { orderList.innerHTML = '<p class="note">No orders yet. Add a shoe and place an order.</p>'; return; }
  mine.forEach((o) => {
    const box = document.createElement("div");
    box.className = "order"; box.dataset.order = o.id;
    const head = document.createElement("div");
    head.className = "order-head";
    head.innerHTML = `<strong>Order ${o.id}</strong><span class="price">₱${o.total.toLocaleString()}</span>`;
    const items = document.createElement("div");
    items.className = "order-items";
    o.items.forEach((id) => {
      const p = products.find((x) => x.id === id);
      const row = document.createElement("div");
      row.append(makePhoto(p, "thumb"), p.name);          // ✎ append(text) is safe, no innerHTML needed
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
    paintOrder(o.id, o.stage, 0);                         // ✎ show the saved progress straight away
  });
}

/* ★ [ORDERS · paint] updates ONE order box: chips, bar width, percent and seconds left */
/* ✎ elapsed = how many ms of the CURRENT step have passed; it makes the numbers move smoothly */
function paintOrder(id, stage, elapsed) {
  const box = document.querySelector(`[data-order="${id}"]`);
  if (!box) return;                                       // ✎ box may be gone if the user signed out
  let done = 0;
  for (let i = 1; i <= stage; i++) done += STAGE_MS[i];   // ✎ time of steps already finished
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

/* ★ [ASYNC · PROMISE + setInterval] waits `ms`, ticking every 100 ms so the numbers can update */
/* ✎ resolve() = the wait finished, reject() = the user cancelled via the AbortController signal */
function waitStep(ms, onTick, signal) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.min(Date.now() - start, ms);
      onTick(elapsed);
      if (elapsed >= ms) { clearInterval(timer); resolve(); }   // ✎ stop the repeat, then finish the promise
    }, 100);
    signal.addEventListener("abort", () => { clearInterval(timer); reject(new DOMException("Cancelled", "AbortError")); });
  });
}

/* ★ [ASYNC · async/await loop] goes through each remaining stage one after another, saving progress */
const trackers = {};                                      // ✎ order id -> AbortController of the running track
async function trackOrder(id) {
  const order = loadOrders().find((o) => o.id === id);
  const box = document.querySelector(`[data-order="${id}"]`);
  const btn = box.querySelector("[data-action=track]");
  const controller = new AbortController();
  trackers[id] = controller;
  btn.textContent = "Cancel tracking";
  try {
    for (let i = order.stage + 1; i < STAGES.length; i++) {
      await waitStep(STAGE_MS[i], (elapsed) => paintOrder(id, i - 1, elapsed), controller.signal); // ✎ await pauses the loop here
      const all = loadOrders();                           // ✎ reload first so a new order placed meanwhile isn't lost
      all.find((o) => o.id === id).stage = i;             // ✎ step reached: save it so a refresh keeps it
      saveOrders(all);
      paintOrder(id, i, 0);
      toast(`${id}: ${STAGES[i]}`);
    }
  } catch (err) {
    if (err.name === "AbortError") toast("Tracking cancelled");
    else toast("Tracking failed: " + err.message);
    btn.textContent = "Track order";
  } finally { delete trackers[id]; }                      // ✎ finally always frees the slot
}

/* ★ [EVENTS · DELEGATION] ONE listener on the order list handles every Track / Cancel button */
orderList.addEventListener("click", (e) => {
  if (e.target.dataset.action !== "track") return;
  const id = e.target.closest(".order").dataset.order;
  if (trackers[id]) trackers[id].abort();                 // ✎ already running -> this click cancels it
  else trackOrder(id);
});

/* ▶ [FORMS + HTTP · POST] checkout: validate, send JSON, then save the order so it can be tracked */
const cName = document.querySelector("#cName"), cEmail = document.querySelector("#cEmail"), cAddr = document.querySelector("#cAddr");
const nameErr = document.querySelector("#cNameErr"), emailErr2 = document.querySelector("#cEmailErr"), addrErr = document.querySelector("#cAddrErr");
cName.addEventListener("input", () => required(cName, nameErr, "Name"));    // ✎ input = live feedback
cAddr.addEventListener("blur", () => required(cAddr, addrErr, "Address"));  // ✎ blur = after leaving field
function checkEmail(input, msgEl) {
  const v = input.value.trim();
  if (v === "") { showError(input, msgEl, "Email is required."); return false; }
  if (!v.includes("@")) { showError(input, msgEl, "Email must contain @."); return false; }
  showValid(input, msgEl); return true;
}
cEmail.addEventListener("input", () => checkEmail(cEmail, emailErr2));

document.querySelector("#checkoutForm").addEventListener("submit", async (e) => {
  e.preventDefault();                            // ✎ stops the page reload
  const ok = [required(cName, nameErr, "Name"), checkEmail(cEmail, emailErr2), required(cAddr, addrErr, "Address")];
  const status = document.querySelector("#orderStatus"), btn = document.querySelector("#payBtn");
  if (ok.includes(false)) return;
  if (!currentUser) { status.className = "err"; status.textContent = "Please sign in first."; location.hash = "#login"; return; }
  if (cart.length === 0) { status.className = "err"; status.textContent = "Add a shoe first."; return; }
  btn.disabled = true; status.className = "note"; status.textContent = "Placing order...";
  try {
    await requestJSON(API + "/posts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer: cName.value.trim(), items: cart.map((p) => p.name) }) // ✎ object -> JSON string
    });
  } catch (err) { console.log("Demo server unreachable, order saved locally:", err.message); } // ✎ the order still goes through offline
  const order = createOrder();                   // ★ the cart is now "bought" and saved under this account
  status.className = "good"; status.textContent = `Order placed! ID: ${order.id}`;
  cart = []; renderCart(); renderOrders(); e.target.reset();
  updateAuthUI();                                // ✎ reset() cleared the form, so refill name + email
  location.hash = "#orders";                     // ★ proceed straight to My Orders
  trackOrder(order.id);                          // ★ and start the tracking timer (setInterval) automatically
  btn.disabled = false;
});

/* ▶ [ASYNC · PROMISE] fake server: sign up saves a user, sign in checks email + password */
function authRequest(mode, name, mail, pass) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = loadUsers();
      const found = users.find((u) => u.email === mail);
      if (mode === "up") {
        if (found) return reject("That email is already registered.");
        const user = { name, email: mail, password: pass };
        users.push(user); saveUsers(users); resolve(user);
      } else {
        if (!found) return reject("No account found. Create one first.");
        if (found.password !== pass) return reject("Wrong password.");
        resolve(found);
      }
    }, 1000);
  });
}

/* ▶ [AUTH · UI] nav button, checkout prefill and My Orders all follow the signed-in state */
const authBtn = document.querySelector("#authBtn");
function updateAuthUI() {
  authBtn.textContent = currentUser ? `Hi, ${currentUser.name} · Logout` : "Sign in";
  if (currentUser) { cName.value = currentUser.name; cEmail.value = currentUser.email; }
  renderOrders();                                // ★ show this account's orders (or the sign-in note)
}
authBtn.addEventListener("click", () => {
  if (currentUser) {                             // ✎ logout clears both storages
    Object.values(trackers).forEach((c) => c.abort()); // ★ stop any tracking still running
    currentUser = null;
    try { localStorage.removeItem("tk_session"); sessionStorage.removeItem("tk_session"); } catch {}
    updateAuthUI(); toast("Signed out");
  } else { location.hash = "#login"; }
});

/* ▶ [AUTH · modes] one form, two modes: "in" = sign in, "up" = create account */
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

/* ▶ [FORMS · login validation] */
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

/* ▶ [ASYNC · async/await + try/catch] submit signs in or creates the account */
document.querySelector("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nameOK = mode === "up" ? required(uName, document.querySelector("#uNameErr"), "Name") : true;
  const emailOK = vEmail(), passOK = vPass();    // ✎ run all so every error shows
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
      const remember = document.querySelector("#remember").checked; // ✎ ON = stays after closing the tab
      try { (remember ? localStorage : sessionStorage).setItem("tk_session", JSON.stringify(currentUser)); } catch {}
      updateAuthUI();
      out.className = "good"; out.textContent = `Login successful! Welcome, ${user.name}.` + (remember ? " Remember Me is ON." : "");
      location.hash = "#shop";                   // ★ send the shopper to the shoes after signing in
    }
  } catch (err) { out.className = "err"; out.textContent = err; }
  finally { btn.disabled = false; }
});
updateAuthUI();                                  // ✎ restores a saved session (and its orders) on page load

/* ▶ [HTTP · GET + query string] load reviews and show them safely */
/* ✎ the old "Track order (slow)" + Cancel buttons were replaced by the real tracker in My Orders */
const statusEl = document.querySelector("#status"), reviewList = document.querySelector("#reviewList"), loadBtn = document.querySelector("#loadBtn");
loadBtn.addEventListener("click", async () => {
  loadBtn.disabled = true;                       // ✎ prevents duplicate clicks
  try {
    statusEl.textContent = "Loading reviews..."; reviewList.innerHTML = "";
    const params = new URLSearchParams({ _limit: "3" });
    const reviews = await requestJSON(API + "/comments?" + params);
    reviews.forEach((r) => {
      const li = document.createElement("li");
      li.textContent = `⭐ ${r.email}: ${r.name}`;  // ✎ textContent = safe for API data
      reviewList.append(li);
    });
    statusEl.textContent = "Reviews loaded.";
  } catch (err) { statusEl.textContent = "Error: " + err.message; }
  finally { loadBtn.disabled = false; }
});

/* ▶ [ASYNC · setInterval + clearInterval] flash-sale countdown from 5:00 */
let seconds = 300;
const countdown = document.querySelector("#countdown");
const saleTimer = setInterval(() => {
  seconds--;
  const m = String(Math.floor(seconds / 60)).padStart(2, "0"), s = String(seconds % 60).padStart(2, "0");
  countdown.textContent = `${m}:${s}`;
  if (seconds <= 0) { clearInterval(saleTimer); countdown.textContent = "Sale ended"; } // ✎ stop the repeat
}, 1000);
