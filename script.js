const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const levelDisplay = document.getElementById("level");
const comboDisplay = document.getElementById("combo");
const startButton = document.getElementById("startButton");
const W = canvas.width;
const H = canvas.height;
const groundY = H - 45;
let score = 0;
let lives = 3;
let level = 1;
let combo = 0;
let running = false;
let gameOver = false;
let lastTime = 0;
let hoopTimer = 0;
let meteorTimer = 0;
let balls = [];
let hoops = [];
let meteors = [];
let particles = [];
const keys = {};
const player = {
x: W / 2,
y: groundY - 25,
speed: 360,
cooldown: 0
};
const stars = Array.from({ length: 90 }, () => ({
x: Math.random() * W,
y: Math.random() * H,
size: Math.random() * 2 + 1,
speed: Math.random() * 15 + 8
}));
document.addEventListener("keydown", (event) => {
keys[event.key.toLowerCase()] = true;
if (event.code === "Space") {
event.preventDefault();
shoot();
}
if (event.key.toLowerCase() === "r" && gameOver) {
startGame();
}
});
document.addEventListener("keyup", (event) => {
keys[event.key.toLowerCase()] = false;
});
canvas.addEventListener("click", shoot);
startButton.addEventListener("click", startGame);
function startGame() {
score = 0;
lives = 3;
level = 1;
combo = 0;
running = true;
gameOver = false;
balls = [];
hoops = [];
meteors = [];
particles = [];
player.x = W / 2;
player.cooldown = 0;
hoopTimer = 0;
meteorTimer = 800;
startButton.textContent = "Restart Game";
updateStats();
}
function shoot() {
if (!running || gameOver || player.cooldown > 0) return;
balls.push({
x: player.x,
y: player.y - 35,
radius: 10,
speed: 520
});
player.cooldown = 0.28;
}
function spawnHoop() {
const width = Math.max(60, 105 - level * 4);
hoops.push({
x: Math.random() * (W - width - 80) + 40,
y: -40,
width,
height: 12,
speed: 75 + level * 8,
scored: false
});
}
function spawnMeteor() {
meteors.push({
x: Math.random() * (W - 40) + 20,
y: -35,
radius: 16 + Math.random() * 10,
speed: 110 + level * 12,
rotation: 0
});
}
function update(dt) {
if (!running || gameOver) return;
if (keys["arrowleft"] || keys["a"]) {
player.x -= player.speed * dt;
}
if (keys["arrowright"] || keys["d"]) {
player.x += player.speed * dt;
}
player.x = Math.max(25, Math.min(W - 25, player.x));
player.cooldown = Math.max(0, player.cooldown - dt);
hoopTimer -= dt;
meteorTimer -= dt;
if (hoopTimer <= 0) {
spawnHoop();
hoopTimer = Math.max(0.65, 1.4 - level * 0.05);
}
if (meteorTimer <= 0) {
spawnMeteor();
meteorTimer = Math.max(0.45, 1.6 - level * 0.06);
}
for (const star of stars) {
star.y += star.speed * dt;
if (star.y > H) {
  star.y = -5;
  star.x = Math.random() * W;
}

}
for (const ball of balls) {
ball.y -= ball.speed * dt;
}
for (const hoop of hoops) {
hoop.y += hoop.speed * dt;
}
for (const meteor of meteors) {
meteor.y += meteor.speed * dt;
meteor.rotation += dt * 2;
if (circleHitsPlayer(meteor)) {
  meteor.y = H + 100;
  lives--;
  combo = 0;
  explode(player.x, player.y, "#ff3d68");

  if (lives <= 0) {
    endGame();
  }
}

}
checkBasketScored();
balls = balls.filter((ball) => ball.y > -30);
meteors = meteors.filter((meteor) => meteor.y < H + 80);
hoops = hoops.filter((hoop) => {
if (hoop.y > H + 40 && !hoop.scored) {
combo = 0;
return false;
}
return hoop.y < H + 60;

});
for (const particle of particles) {
particle.x += particle.vx * dt;
particle.y += particle.vy * dt;
particle.life -= dt;
}
particles = particles.filter((particle) => particle.life > 0);
level = Math.floor(score / 100) + 1;
updateStats();
}
function circleHitsPlayer(meteor) {
const closestX = Math.max(
player.x - 22,
Math.min(meteor.x, player.x + 22)
);
const closestY = Math.max(
player.y - 38,
Math.min(meteor.y, player.y + 20)
);
const dx = meteor.x - closestX;
const dy = meteor.y - closestY;
return dx * dx + dy * dy < meteor.radius * meteor.radius;
}
function checkBasketScored() {
for (const ball of balls) {
for (const hoop of hoops) {
const passedThrough =
ball.x > hoop.x &&
ball.x < hoop.x + hoop.width &&
ball.y > hoop.y &&
ball.y < hoop.y + hoop.height &&
!hoop.scored;
  if (passedThrough) {
    hoop.scored = true;
    score += 25 + combo * 5;
    combo++;

    explode(ball.x, ball.y, "#ffdc5e");

    balls = balls.filter((item) => item !== ball);
    break;
  }
}

}
}
function explode(x, y, color) {
for (let i = 0; i < 18; i++) {
const angle = Math.random() * Math.PI * 2;
const speed = 40 + Math.random() * 100;
particles.push({
  x,
  y,
  vx: Math.cos(angle) * speed,
  vy: Math.sin(angle) * speed,
  size: 3 + Math.random() * 4,
  color,
  life: 0.7
});

}
}
function endGame() {
running = false;
gameOver = true;
startButton.textContent = "Play Again";
}
function updateStats() {
scoreDisplay.textContent = score;
livesDisplay.textContent = lives;
levelDisplay.textContent = level;
comboDisplay.textContent = combo;
}
function draw() {
drawBackground();
drawHoops();
drawMeteors();
drawBalls();
drawPlayer();
drawParticles();
if (!running && !gameOver) {
overlay("METEOR HOOPS", "Press Start Game to play");
}
if (gameOver) {
overlay("GAME OVER", Score: ${score} — Press Play Again);
}
}
function drawBackground() {
const gradient = ctx.createLinearGradient(0, 0, 0, H);
gradient.addColorStop(0, "#080b25");
gradient.addColorStop(1, "#1b1550");
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, W, H);
for (const star of stars) {
ctx.fillStyle = "white";
ctx.globalAlpha = 0.4 + star.size / 4;
ctx.fillRect(star.x, star.y, star.size, star.size);
}
ctx.globalAlpha = 1;
ctx.fillStyle = "#202b60";
ctx.fillRect(0, groundY, W, H - groundY);
ctx.strokeStyle = "#55eaff";
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(0, groundY);
ctx.lineTo(W, groundY);
ctx.stroke();
}
function drawPlayer() {
ctx.save();
ctx.translate(player.x, player.y);
ctx.fillStyle = "#5ce1e6";
ctx.beginPath();
ctx.moveTo(0, -38);
ctx.lineTo(-23, 20);
ctx.lineTo(0, 10);
ctx.lineTo(23, 20);
ctx.closePath();
ctx.fill();
ctx.fillStyle = "#ffdc5e";
ctx.beginPath();
ctx.arc(0, -10, 13, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = "#ff8c32";
ctx.beginPath();
ctx.arc(0, -10, 8, 0, Math.PI * 2);
ctx.fill();
ctx.restore();
}
function drawBalls() {
for (const ball of balls) {
ctx.fillStyle = "#ff8c32";
ctx.beginPath();
ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
ctx.fill();
ctx.strokeStyle = "#632b10";
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(ball.x, ball.y, ball.radius * 0.65, 0, Math.PI * 2);
ctx.stroke();

}
}
function drawHoops() {
for (const hoop of hoops) {
ctx.shadowColor = "#ffdc5e";
ctx.shadowBlur = 14;
ctx.strokeStyle = "#ffdc5e";
ctx.lineWidth = 6;
ctx.strokeRect(hoop.x, hoop.y, hoop.width, hoop.height);

ctx.shadowBlur = 0;
ctx.strokeStyle = "white";
ctx.lineWidth = 2;

for (let x = hoop.x + 8; x < hoop.x + hoop.width; x += 13) {
  ctx.beginPath();
  ctx.moveTo(x, hoop.y + hoop.height);
  ctx.lineTo(x - 5, hoop.y + 35);
  ctx.stroke();
}

}
}
function drawMeteors() {
for (const meteor of meteors) {
ctx.save();
ctx.translate(meteor.x, meteor.y);
ctx.rotate(meteor.rotation);
ctx.fillStyle = "#dc4d4d";
ctx.beginPath();

for (let i = 0; i < 9; i++) {
  const angle = (Math.PI * 2 * i) / 9;
  const radius = meteor.radius * (0.8 + Math.random() * 0.25);
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  if (i === 0) ctx.moveTo(x, y);
  else ctx.lineTo(x, y);
}

ctx.closePath();
ctx.fill();

ctx.fillStyle = "#ffae45";
ctx.beginPath();
ctx.arc(-5, -4, 4, 0, Math.PI * 2);
ctx.fill();

ctx.restore();

}
}
function drawParticles() {
for (const particle of particles) {
ctx.globalAlpha = Math.max(0, particle.life);
ctx.fillStyle = particle.color;
ctx.fillRect(
particle.x,
particle.y,
particle.size,
particle.size
);
}
ctx.globalAlpha = 1;
}
function overlay(title, subtitle) {
ctx.fillStyle = "rgba(4, 6, 20, 0.78)";
ctx.fillRect(0, 0, W, H);
ctx.textAlign = "center";
ctx.fillStyle = "#ffdc5e";
ctx.font = "bold 44px Arial";
ctx.fillText(title, W / 2, H / 2 - 20);
ctx.fillStyle = "white";
ctx.font = "20px Arial";
ctx.fillText(subtitle, W / 2, H / 2 + 25);
}
function gameLoop(time) {
const dt = Math.min((time - lastTime) / 1000 || 0, 0.05);
lastTime = time;
update(dt);
draw();
requestAnimationFrame(gameLoop);
}
updateStats();
gameLoop(0);
