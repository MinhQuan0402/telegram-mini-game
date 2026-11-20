// Star Catcher — a tiny Telegram Mini App game.
// Works in a normal browser too; Telegram features are used only when available.

const tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
  tg.ready();   // tell Telegram the app has loaded
  tg.expand();  // use the full available height
}

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const livesEl = document.getElementById("lives");
const overlay = document.getElementById("overlay");
const messageEl = document.getElementById("message");
const startBtn = document.getElementById("start");

let W, H, dpr;
function resize() {
  dpr = window.devicePixelRatio || 1;
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

// ---- State ----
const basket = { x: 0, y: 0, w: 90, h: 22 };
let items = [];
let score = 0;
let lives = 3;
let best = Number(localStorage.getItem("best") || 0);
let running = false;
let spawnTimer = 0;
let lastTime = 0;
bestEl.textContent = best;

function haptic(type) {
  if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred(type);
}

// ---- Input: drag / mouse move ----
function moveBasket(clientX) {
  basket.x = Math.max(0, Math.min(W - basket.w, clientX - basket.w / 2));
}
canvas.addEventListener("pointermove", (e) => moveBasket(e.clientX));
canvas.addEventListener("pointerdown", (e) => moveBasket(e.clientX));

// ---- Game loop ----
function start() {
  score = 0;
  lives = 3;
  items = [];
  spawnTimer = 0;
  basket.x = W / 2 - basket.w / 2;
  basket.y = H - 70;
  updateHud();
  overlay.classList.add("hidden");
  if (tg) tg.MainButton.hide();
  running = true;
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function gameOver() {
  running = false;
  if (score > best) {
    best = score;
    localStorage.setItem("best", best);
  }
  updateHud();
  haptic("error");
  messageEl.innerHTML = `Game over! You scored <b>${score}</b>.`;
  startBtn.textContent = "Play again";
  overlay.classList.remove("hidden");

  // Show Telegram's native MainButton to send the score back to the bot
  if (tg && tg.initData) {
    tg.MainButton.setText(`Send score (${score}) to bot`);
    tg.MainButton.show();
  }
}

function spawn() {
  const isBomb = Math.random() < 0.2;
  items.push({
    x: 20 + Math.random() * (W - 40),
    y: -20,
    r: 14,
    speed: 140 + Math.random() * 80 + score * 4, // gets faster over time
    bomb: isBomb,
  });
}

function loop(now) {
  if (!running) return;
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawn();
    spawnTimer = Math.max(0.35, 0.9 - score * 0.01);
  }

  for (const it of items) it.y += it.speed * dt;

  // Collisions
  items = items.filter((it) => {
    const caught =
      it.y + it.r >= basket.y &&
      it.y - it.r <= basket.y + basket.h &&
      it.x >= basket.x &&
      it.x <= basket.x + basket.w;

    if (caught) {
      if (it.bomb) {
        lives--;
        haptic("error");
      } else {
        score++;
        haptic("success");
      }
      updateHud();
      return false;
    }
    if (it.y - it.r > H) {
      if (!it.bomb) {
        lives--; // missed a star
        haptic("warning");
        updateHud();
      }
      return false;
    }
    return true;
  });

  draw();

  if (lives <= 0) gameOver();
  else requestAnimationFrame(loop);
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "28px sans-serif";
  for (const it of items) ctx.fillText(it.bomb ? "💣" : "⭐", it.x, it.y);

  ctx.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue("--btn").trim() || "#2ea6ff";
  ctx.beginPath();
  ctx.roundRect(basket.x, basket.y, basket.w, basket.h, 8);
  ctx.fill();
}

function updateHud() {
  scoreEl.textContent = score;
  livesEl.textContent = Math.max(0, lives);
  bestEl.textContent = best;
}

startBtn.addEventListener("click", start);

// Telegram MainButton: send the score to the bot (works when opened from a keyboard button)
if (tg) {
  tg.MainButton.onClick(() => {
    tg.sendData(JSON.stringify({ score }));
  });
}
