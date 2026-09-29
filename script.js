const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const levelDisplay = document.getElementById("level");
const comboDisplay = document.getElementById("combo");
const startButton = document.getElementById("startButton");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const floorY = HEIGHT - 45;
let score = 0;
let lives = 3;
let level = 1;
let combo = 0;
let gameRunning = false;
let gameOver = false;
let lastTime = 0;
let hoopTimer = 0;
let meteorTimer = 0;
let particles = [];
let stars = [];
const keys = {};
const player = {
x: WIDTH / 2,
y: floorY - 42,
width: 42,
height: 42,
speed: 0.45,
cooldown: 0
};
let balls = [];
let hoops = [];
let meteors = [];
for (let i = 0; i < 90; i++) {
stars.push({
x: Math.random() * WIDTH,
y: Math.random() * HEIGHT,
size: Math.random() * 2.5 + 0.5,
speed: Math.random() * 0.04 + 0.01
});
}
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
gameOver = false;
gameRunning = true;
balls = [];
hoops = [];
meteors = [];
particles = [];
player.x = WIDTH / 2;
player.cooldown = 0;
startButton.textContent = "Restart Game";
updateStats();
spawnHoop();
}
function shoot() {
if (!gameRunning || gameOver || player.cooldown > 0) return;
balls.push({
x: player.x,
y: player.y - 22,
radius: 10,
speed: 7.5
});
player.cooldown = 260;
}
function spawnHoop() {
const size = Math.max(58, 90 - level * 3);
hoops.push({
x: Math.random() * (WIDTH - size - 100) + 50,
y: -35,
width: size,
height: 12,
speed: 1.2 + level * 0.18,
passed: false
});
}
function spawnMeteor() {
meteors.push({
x: Math.random() * (WIDTH - 50) + 25,
y: -40,
radius: Math.random() * 12 + 14,
speed: 2 + level * 0.35,
rotation: Math.random() * Math.PI
});
}
function update(delta) {
if (!gameRunning || gameOver) return;
const movement =
keys["arrowleft"] || keys["a"]
? -1
: keys["arrowright"] || keys["d"]
? 1
: 0;
player.x += movement * player.speed * delta;
player.x = Math.max(25, Math.min(WIDTH - 25, player.x));
if (player.cooldown > 0) {
player.cooldown -= delta;
}
hoopTimer -= delta;
meteorTimer -= delta;
if (hoopTimer <= 0) {
spawnHoop();
hoopTimer = Math.max(500, 1350 - level * 70);
}
if (meteorTimer <= 0) {
spawnMeteor();
meteorTimer = Math.max(500, 1800 - level * 90);
}
updateStars(delta);
updateBalls(delta);
updateHoops(delta);
updateMeteors(delta);
updateParticles(delta);
level = Math.floor(score / 100) + 1;
updateStats();
}
function updateStars(delta) {
stars.forEach((star) => {
star.y += star.speed * delta;
if (star.y > HEIGHT) {
  star.y = -5;
  star.x = Math.random() * WIDTH;
}

});
}
function updateBalls(delta) {
balls.forEach((ball) => {
ball.y -= ball.speed * delta;
});
balls = balls.filter((ball) => ball.y > -30);
for (const ball of balls) {
for (const hoop of hoops) {
const insideHoop =
ball.x > hoop.x &&
ball.x < hoop.x + hoop.width &&
ball.y > hoop.y &&
ball.y < hoop.y + hoop.height;
  if (insideHoop && !hoop.passed) {
    hoop.passed = true;
    score += 25 + combo * 5;
    combo++;

    createExplosion(ball.x, ball.y, "#ffdc5e");
    removeHoop(hoop);
    break;
  }
}

}
}
function updateHoops(delta) {
hoops.forEach((hoop) => {
hoop.y += hoop.speed * delta;
});
for (const hoop of hoops) {
if (hoop.y > HEIGHT + 30 && !hoop.passed) {
hoop.passed = true;
combo = 0;
removeHoop(hoop);
}
}
}
function updateMeteors(delta) {
meteors.forEach((meteor) => {
meteor.y += meteor.speed * delta;
meteor.rotation += 0.03 * delta;
const hitPlayer =
  meteor.y + meteor.radius > player.y &&
  meteor.y - meteor.radius < player.y + player.height &&
  meteor.x + meteor.radius > player.x - player.width / 2 &&
  meteor.x - meteor.radius < player.x + player.width / 2;

if (hitPlayer) {
  lives--;
  combo = 0;
  createExplosion(player.x, player.y, "#ff4d6d");
  meteor.y = HEIGHT + 100;
  updateStats();

  if (lives <= 0) {
    endGame();
  }
}

});
meteors = meteors.filter((meteor) => meteor.y < HEIGHT + 80);
}
function updateParticles(delta) {
particles.forEach((particle) => {
particle.x += particle.velocityX * delta;
particle.y += particle.velocityY * delta;
particle.velocityY += 0.002 * delta;
particle.life -= delta;
});
particles = particles.filter((particle) => particle.life > 0);
}
function removeHoop(hoop) {
const index = hoops.indexOf(hoop);
if (index !== -1) {
hoops.splice(index, 1);
}
}
function createExplosion(x, y, color) {
for (let i = 0; i < 18; i++) {
const angle = Math.random() * Math.PI * 2;
const speed = Math.random() * 0.25 + 0.05;
particles.push({
  x,
  y,
  color,
  size: Math.random() * 5 + 2,
  velocityX: Math.cos(angle) * speed,
  velocityY: Math.sin(angle) * speed,
  life: 700
});

}
}
function endGame() {
gameOver = true;
gameRunning = false;
startButton.textContent = "Play Again";
}
function updateStats() {
scoreDisplay.textContent = score;
livesDisplay.textContent = lives;
levelDisplay.textContent = level;
comboDisplay.textContent = combo;
}
function draw() {
drawSpace();
drawHoops();
drawMeteors();
drawBalls();
drawPlayer();
drawParticles();
if (!gameRunning && !gameOver) {
drawOverlay("METEOR HOOPS", "Click Start Game to begin");
}
if (gameOver) {
drawOverlay("GAME OVER", Final Score: ${score} — Press R or Play Again);
}
}
function drawSpace() {
const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
gradient.addColorStop(0, "#080b25");
gradient.addColorStop(1, "#17134a");
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, WIDTH, HEIGHT);
stars.forEach((star) => {
ctx.fillStyle = rgba(255,255,255,${0.35 + star.size / 4});
ctx.fillRect(star.x, star.y, star.size, star.size);
});
ctx.fillStyle = "#202b60";
ctx.fillRect(0, floorY, WIDTH, HEIGHT - floorY);
ctx.strokeStyle = "#54e6ff";
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(0, floorY);
ctx.lineTo(WIDTH, floorY);
ctx.stroke();
}
function drawPlayer() {
ctx.save();
ctx.translate(player.x, player.y);
ctx.fillStyle = "#5ce1e6";
ctx.beginPath();
ctx.moveTo(0, -35);
ctx.lineTo(-22, 18);
ctx.lineTo(0, 8);
ctx.lineTo(22, 18);
ctx.closePath();
ctx.fill();
ctx.fillStyle = "#ffdc5e";
ctx.beginPath();
ctx.arc(0, -8, 13, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = "#ff8c32";
ctx.beginPath();
ctx.arc(0, -8, 8, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = "#ff5b36";
ctx.fillRect(-9, 18, 18, 11);
ctx.restore();
}
function drawBalls() {
balls.forEach((ball) => {
ctx.fillStyle = "#ff8c32";
ctx.beginPath();
ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
ctx.fill();
ctx.strokeStyle = "#57270e";
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(ball.x, ball.y, ball.radius * 0.65, 0, Math.PI * 2);
ctx.stroke();

});
}
function drawHoops() {
hoops.forEach((hoop) => {
ctx.shadowColor = "#ffdc5e";
ctx.shadowBlur = 12;
ctx.strokeStyle = "#ffdc5e";
ctx.lineWidth = 6;
ctx.strokeRect(hoop.x, hoop.y, hoop.width, hoop.height);

ctx.shadowBlur = 0;

ctx.strokeStyle = "#ffffff";
ctx.lineWidth = 2;

for (let x = hoop.x + 8; x < hoop.x + hoop.width; x += 13) {
  ctx.beginPath();
  ctx.moveTo(x, hoop.y + hoop.height);
  ctx.lineTo(x - 5, hoop.y + 35);
  ctx.stroke();
}

});
}
function drawMeteors() {
meteors.forEach((meteor) => {
ctx.save();
ctx.translate(meteor.x, meteor.y);
ctx.rotate(meteor.rotation);
ctx.fillStyle = "#d94b4b";
ctx.beginPath();

for (let i = 0; i < 9; i++) {
  const angle = (Math.PI * 2 * i) / 9;
  const radius = meteor.radius * (0.75 + Math.random() * 0.35);
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  if (i === 0) ctx.moveTo(x, y);
  else ctx.lineTo(x, y);
}

ctx.closePath();
ctx.fill();

ctx.fillStyle = "#ff9b45";
ctx.beginPath();
ctx.arc(-5, -4, 4, 0, Math.PI * 2);
ctx.fill();

ctx.restore();

});
}
function drawParticles() {
particles.forEach((particle) => {
ctx.globalAlpha = Math.max(0, particle.life / 700);
ctx.fillStyle = particle.color;
ctx.fillRect(
particle.x,
particle.y,
particle.size,
particle.size
);
});
ctx.globalAlpha = 1;
}
function drawOverlay(title, message) {
ctx.fillStyle = "rgba(5, 8, 25, 0.75)";
ctx.fillRect(0, 0, WIDTH, HEIGHT);
ctx.fillStyle = "#ffdc5e";
ctx.font = "bold 46px Arial";
ctx.textAlign = "center";
ctx.fillText(title, WIDTH / 2, HEIGHT / 2 - 20);
ctx.fillStyle = "#ffffff";
ctx.font = "20px Arial";
ctx.fillText(message, WIDTH / 2, HEIGHT / 2 + 28);
}
function gameLoop(timestamp) {
const delta = Math.min(timestamp - lastTime || 16, 40);
lastTime = timestamp;
update(delta);
draw();
requestAnimationFrame(gameLoop);
}
gameLoop(0);
