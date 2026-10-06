/* ==========================================================
   TREADKICKS - script.js
   Comment style: each block starts with "Topic: description",
   where the topic names the concept being demonstrated.
   Short comments after // explain a single line.
   ========================================================== */

/* OOP, Inheritance: the parent class holds what every shoe shares. */
class Product {
  constructor(id, name, price, image) { this.id = id; this.name = name; this.price = price; this.image = image; }
  describe() { return this.name; }              // The child classes override this method.
}
/* OOP, extends and super(): each child class calls the parent constructor first. */
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

/* Arrays: one array holds every child type, which is polymorphism in action.
   The JPG files go in an "images" folder next to index.html, and the file names must match the paths below.
   To add a shoe, copy one line and change the id, name, price and JPG path. */
const products = [
  new Sneaker(1, "AirStride Runner", 4500, "images/airstride.jpg"), new Sneaker(2, "Court Classic", 3800, "images/court-classic.jpg"),
  new Boot(3, "Trail Boss", 5200, "images/trail-boss.jpg"),          new Boot(4, "Urban Chelsea", 4900, "images/urban-chelsea.jpg"),
  new Sandal(5, "Breeze Slide", 1500, "images/breeze-slide.jpg"),    new Sandal(6, "Sunwalk", 1800, "images/sunwalk.jpg")
];
let cart = [];                                   // The cart holds the items the customer added.

/* DOM, selecting: the main elements are grabbed once and reused everywhere. */
const grid = document.querySelector("#productGrid");
const cartList = document.querySelector("#cartList");
const eventLog = document.querySelector("#eventLog");

/* Utility, setTimeout: the toast message hides itself after 2.5 seconds. */
function toast(message) {
  const t = document.querySelector("#toast");
  t.textContent = message;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500); // 2500 ms equals 2.5 seconds.
}

/* Images: the function shows the real JPG photo, and swaps in the emoji if the file is missing so nothing breaks. */
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

/* DOM, createElement: one product card is built in memory and then returned. */
function createCard(p) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.id = p.id;                        // The data-id lets event delegation find the product.
  card.dataset.category = p.category;
  const icon = makePhoto(p, "photo");
  const title = document.createElement("h3");
  title.textContent = p.name;
  const desc = document.createElement("p");
  desc.textContent = p.describe();               // Polymorphism: the same call gives different text per class.
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

/* DOM, classList: the category filter and the search box both toggle the "hidden" class. */
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
document.querySelector("#search").addEventListener("input", applyFilters); // The search updates live while typing.

/* Events, capturing: the third argument true makes this listener run first, from parent to child. */
grid.addEventListener("click", () => {
  eventLog.textContent = "1. Capturing: grid saw the click first\n";
}, true);

/* Events, delegation and bubbling: one listener on the grid serves every card. */
grid.addEventListener("click", (e) => {
  const card = e.target.closest(".card");        // closest() still works when an inner element is clicked.
  if (!card) return;
  eventLog.textContent += `2. Bubbling: target=${e.target.tagName}, currentTarget=${e.currentTarget.id}`;
  const action = e.target.dataset.action;
  if (action === "add") addToCart(Number(card.dataset.id));
  else if (action === "wish") toggleWish(e.target);
  else card.classList.toggle("selected");
});
/* Events, stopPropagation: wishlist clicks must not reach the document. */
document.addEventListener("click", (e) => {
  if (e.target.dataset.action === "wish") console.log("This should never print for the heart button");
});
grid.addEventListener("click", (e) => { if (e.target.dataset.action === "wish") e.stopPropagation(); });

/* Arrays, push: the chosen product is added to the end of the cart array. */
function addToCart(id) {
  const product = products.find((p) => p.id === id);
  cart.push(product);
  renderCart();
  toast(product.name + " added!");
}
/* Arrays, pop: the last item added is removed from the cart. */
document.querySelector("#undoBtn").addEventListener("click", () => {
  const removed = cart.pop();
  console.log("Removed:", removed, "Updated cart:", cart);
  renderCart();
});

/* DOM, render: the cart list and the totals are rebuilt from the cart array. */
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
  if (cart.length === 0) {                       // An empty cart shows a message instead of a blank list.
    const li = document.createElement("li"); li.textContent = "Your cart is empty."; cartList.append(li);
  }
  let total = 0;
  cart.forEach((p) => { total += p.price; });
  document.querySelector("#cartTotal").textContent = "₱" + total.toLocaleString();
  document.querySelector("#cartCount").textContent = cart.length;
}
renderCart();

/* HTTP, helper: one function handles every request and checks response.ok. */
const API = "https://jsonplaceholder.typicode.com";
async function requestJSON(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error("HTTP " + response.status); // fetch does not throw on a 404, so the check is manual.
  if (response.status === 204) return null;
  return response.json();
}

/* HTTP, PATCH: the wishlist heart sends a partial update, then swaps the symbol. */
async function toggleWish(btn) {
  try {
    await requestJSON(API + "/posts/1", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "wishlist" })
    });
    const next = document.createElement("button");     // replaceWith swaps the old button for a new one.
    next.className = "btn ghost"; next.dataset.action = "wish";
    next.textContent = btn.textContent === "♡" ? "♥" : "♡";
    btn.replaceWith(next);
  } catch (err) { toast("Wishlist failed: " + err.message); }
}
/* HTTP, DELETE and DOM removal: an item leaves the page only after the server confirms. */
cartList.addEventListener("click", async (e) => {
  if (e.target.dataset.action !== "remove") return;
  const li = e.target.closest("li");
  try {
    await requestJSON(API + "/posts/1", { method: "DELETE" });
    cart.splice(Number(li.dataset.index), 1);
    renderCart();
  } catch (err) { toast("Remove failed: " + err.message); }
});

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
function loadUsers() { try { return JSON.parse(localStorage.getItem("tk_users")) || []; } catch { return []; } }
function saveUsers(list) { try { localStorage.setItem("tk_users", JSON.stringify(list)); } catch {} }
let currentUser = null;                          // null means nobody is signed in.
try { currentUser = JSON.parse(localStorage.getItem("tk_session") || sessionStorage.getItem("tk_session")); } catch {}

/* Orders, storage: every bought order is saved with the buyer's email, so each account sees only its own. */
function loadOrders() { try { return JSON.parse(localStorage.getItem("tk_orders")) || []; } catch { return []; } }
function saveOrders(list) { try { localStorage.setItem("tk_orders", JSON.stringify(list)); } catch {} }
function myOrders() { return currentUser ? loadOrders().filter((o) => o.email === currentUser.email) : []; }

/* Orders, stages: STAGE_MS is how long each step takes to be reached, and 0 means done at purchase.
   Changing a number speeds up or slows down the tracking demo. */
const STAGES = ["Order placed", "Packed", "Shipped", "Out for delivery", "Delivered"];
const STAGE_MS = [0, 3000, 4000, 3000, 3000];
const TOTAL_MS = STAGE_MS.reduce((a, b) => a + b, 0);   // reduce adds every step together, giving 13000 ms.

/* Orders, buying: checkout calls this to turn the cart into a saved order for the signed-in user. */
function createOrder() {
  const order = {
    id: "TK-" + Date.now().toString().slice(-6),         // The last 6 digits of the clock make a unique-enough id.
    email: currentUser.email,
    items: cart.map((p) => p.id),                         // Only ids are stored; the products array gives the name and photo later.
    total: cart.reduce((sum, p) => sum + p.price, 0),
    stage: 0                                              // Stage 0 is "Order placed".
  };
  const all = loadOrders(); all.unshift(order);           // unshift puts the newest order on top.
  saveOrders(all);
  return order;
}

/* Orders, render: the order boxes are built from storage, and paintOrder() fills in the tracking numbers. */
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
      row.append(makePhoto(p, "thumb"), p.name);          // append() with plain text is safe, so innerHTML is not needed.
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
  const order = loadOrders().find((o) => o.id === id);
  const box = document.querySelector(`[data-order="${id}"]`);
  const btn = box.querySelector("[data-action=track]");
  const controller = new AbortController();
  trackers[id] = controller;
  btn.textContent = "Cancel tracking";
  try {
    for (let i = order.stage + 1; i < STAGES.length; i++) {
      await waitStep(STAGE_MS[i], (elapsed) => paintOrder(id, i - 1, elapsed), controller.signal); // await pauses the loop until the step ends.
      const all = loadOrders();                           // The orders are reloaded first so an order placed meanwhile is not lost.
      all.find((o) => o.id === id).stage = i;             // The reached step is saved so a refresh keeps it.
      saveOrders(all);
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
  if (!v.includes("@")) { showError(input, msgEl, "Email must contain @."); return false; }
  showValid(input, msgEl); return true;
}
cEmail.addEventListener("input", () => checkEmail(cEmail, emailErr2));

document.querySelector("#checkoutForm").addEventListener("submit", async (e) => {
  e.preventDefault();                            // This stops the page from reloading.
  const ok = [required(cName, nameErr, "Name"), checkEmail(cEmail, emailErr2), required(cAddr, addrErr, "Address")];
  const status = document.querySelector("#orderStatus"), btn = document.querySelector("#payBtn");
  if (ok.includes(false)) return;
  if (!currentUser) { status.className = "err"; status.textContent = "Please sign in first."; location.hash = "#login"; return; }
  if (cart.length === 0) { status.className = "err"; status.textContent = "Add a shoe first."; return; }
  btn.disabled = true; status.className = "note"; status.textContent = "Placing order...";
  try {
    await requestJSON(API + "/posts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer: cName.value.trim(), items: cart.map((p) => p.name) }) // The object is turned into a JSON string.
    });
  } catch (err) { console.log("Demo server unreachable, order saved locally:", err.message); } // The order still goes through when offline.
  const order = createOrder();                   // The cart is now bought and saved under this account.
  status.className = "good"; status.textContent = `Order placed! ID: ${order.id}`;
  cart = []; renderCart(); renderOrders(); e.target.reset();
  updateAuthUI();                                // reset() cleared the form, so the name and email are filled in again.
  location.hash = "#orders";                     // The page moves straight to My Orders.
  trackOrder(order.id);                          // Tracking starts automatically, so setInterval begins ticking.
  btn.disabled = false;
});

/* Async, Promise: a fake server where sign up saves a user and sign in checks the email and password. */
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

/* Auth, UI: the nav button, the checkout prefill and My Orders all follow the signed-in state. */
const authBtn = document.querySelector("#authBtn");
function updateAuthUI() {
  authBtn.textContent = currentUser ? `Hi, ${currentUser.name} · Logout` : "Sign in";
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
updateAuthUI();                                  // This restores a saved session and its orders on page load.

/* HTTP, GET and query string: the reviews are loaded and shown safely.
   The old slow-tracking and cancel buttons were replaced by the real tracker in My Orders. */
const statusEl = document.querySelector("#status"), reviewList = document.querySelector("#reviewList"), loadBtn = document.querySelector("#loadBtn");
loadBtn.addEventListener("click", async () => {
  loadBtn.disabled = true;                       // This prevents duplicate clicks.
  try {
    statusEl.textContent = "Loading reviews..."; reviewList.innerHTML = "";
    const params = new URLSearchParams({ _limit: "3" });
    const reviews = await requestJSON(API + "/comments?" + params);
    reviews.forEach((r) => {
      const li = document.createElement("li");
      li.textContent = `⭐ ${r.email}: ${r.name}`;  // textContent is safe for data that comes from an API.
      reviewList.append(li);
    });
    statusEl.textContent = "Reviews loaded.";
  } catch (err) { statusEl.textContent = "Error: " + err.message; }
  finally { loadBtn.disabled = false; }
});

/* Async, setInterval and clearInterval: the flash-sale countdown runs down from 5:00. */
let seconds = 300;
const countdown = document.querySelector("#countdown");
const saleTimer = setInterval(() => {
  seconds--;
  const m = String(Math.floor(seconds / 60)).padStart(2, "0"), s = String(seconds % 60).padStart(2, "0");
  countdown.textContent = `${m}:${s}`;
  if (seconds <= 0) { clearInterval(saleTimer); countdown.textContent = "Sale ended"; } // clearInterval stops the repeat.
}, 1000);
