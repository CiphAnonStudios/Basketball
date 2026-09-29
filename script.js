const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("score");
const shotsText = document.getElementById("shots");
const powerText = document.getElementById("powerText");
const resetButton = document.getElementById("resetButton");
const groundY = 445;
const gravity = 0.35;
const player = {
x: 130,
y: groundY - 80,
width: 45,
height: 80
};
const hoop = {
x: 720,
y: 190,
width: 100,
rimHeight: 8
};
const ball = {
x: player.x + 55,
y: player.y + 25,
radius: 14,
velocityX: 0,
velocityY: 0,
flying: false,
scored: false
};
let score = 0;
let shots = 0;
let power = 50;
let charging = false;
let mouseX = 500;
let mouseY = 250;
canvas.addEventListener("mousemove", (event) => {
const rect = canvas.getBoundingClientRect();
mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);
});
canvas.addEventListener("mousedown", () => {
if (!ball.flying) {
charging = true;
}
});
canvas.addEventListener("mouseup", () => {
if (charging && !ball.flying) {
shootBall();
}
charging = false;
});
resetButton.addEventListener("click", resetGame);
function shootBall() {
shots++;
shotsText.textContent = shots;
const startX = player.x + 55;
const startY = player.y + 25;
const directionX = mouseX - startX;
const directionY = mouseY - startY;
const distance = Math.sqrt(directionX ** 2 + directionY ** 2);
const speed = 7 + power / 12;
ball.x = startX;
ball.y = startY;
ball.velocityX = (directionX / distance) * speed;
ball.velocityY = (directionY / distance) * speed;
ball.flying = true;
ball.scored = false;
}
function update() {
if (charging) {
power += 1;
if (power >= 100) {
  power = 100;
}

powerText.textContent = `${power}%`;

}
if (ball.flying) {
const previousY = ball.y;
ball.velocityY += gravity;
ball.x += ball.velocityX;
ball.y += ball.velocityY;

const crossedHoop =
  previousY < hoop.y &&
  ball.y >= hoop.y &&
  ball.x > hoop.x &&
  ball.x < hoop.x + hoop.width;

if (crossedHoop && ball.velocityY > 0 && !ball.scored) {
  score++;
  scoreText.textContent = score;
  ball.scored = true;
}

if (ball.y + ball.radius >= groundY) {
  ball.y = groundY - ball.radius;
  ball.velocityY *= -0.55;
  ball.velocityX *= 0.75;

  if (Math.abs(ball.velocityY) < 1.5) {
    resetBall();
  }
}

if (
  ball.x < -50 ||
  ball.x > canvas.width + 50 ||
  ball.y > canvas.height + 100
) {
  resetBall();
}

}
}
function resetBall() {
ball.x = player.x + 55;
ball.y = player.y + 25;
ball.velocityX = 0;
ball.velocityY = 0;
ball.flying = false;
power = 50;
powerText.textContent = "50%";
}
function resetGame() {
score = 0;
shots = 0;
scoreText.textContent = "0";
shotsText.textContent = "0";
resetBall();
}
function drawBackground() {
const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
skyGradient.addColorStop(0, "#76c9ff");
skyGradient.addColorStop(1, "#d5f2ff");
ctx.fillStyle = skyGradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = "#55a84f";
ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
ctx.strokeStyle = "white";
ctx.lineWidth = 4;
ctx.beginPath();
ctx.moveTo(0, groundY);
ctx.lineTo(canvas.width, groundY);
ctx.stroke();
}
function drawHoop() {
ctx.fillStyle = "#555";
ctx.fillRect(810, 160, 14, groundY - 160);
ctx.fillStyle = "white";
ctx.fillRect(765, 120, 70, 55);
ctx.strokeStyle = "#333";
ctx.lineWidth = 4;
ctx.strokeRect(765, 120, 70, 55);
ctx.fillStyle = "#f0442e";
ctx.fillRect(hoop.x, hoop.y, hoop.width, hoop.rimHeight);
ctx.strokeStyle = "#f0442e";
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(hoop.x + 10, hoop.y + 8);
ctx.lineTo(hoop.x + 25, hoop.y + 50);
ctx.lineTo(hoop.x + 75, hoop.y + 50);
ctx.lineTo(hoop.x + 90, hoop.y + 8);
ctx.stroke();
}
function drawPlayer() {
const centerX = player.x + player.width / 2;
ctx.fillStyle = "#222";
ctx.fillRect(player.x + 5, player.y + 35, player.width - 10, 45);
ctx.fillStyle = "#ffcc99";
ctx.beginPath();
ctx.arc(centerX, player.y + 20, 18, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = "#2374d8";
ctx.fillRect(player.x + 4, player.y + 34, player.width - 8, 35);
ctx.strokeStyle = "#ffcc99";
ctx.lineWidth = 8;
ctx.beginPath();
ctx.moveTo(player.x + 8, player.y + 45);
ctx.lineTo(player.x - 15, player.y + 65);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(player.x + player.width - 8, player.y + 45);
ctx.lineTo(player.x + player.width + 15, player.y + 28);
ctx.stroke();
}
function drawBall() {
ctx.fillStyle = "#e87522";
ctx.beginPath();
ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
ctx.fill();
ctx.strokeStyle = "#552b12";
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(ball.x, ball.y, ball.radius * 0.65, 0, Math.PI * 2);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(ball.x - ball.radius, ball.y);
ctx.quadraticCurveTo(ball.x, ball.y - 5, ball.x + ball.radius, ball.y);
ctx.stroke();
}
function drawAimLine() {
if (!ball.flying) {
const startX = player.x + 55;
const startY = player.y + 25;
ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
ctx.setLineDash([8, 8]);
ctx.lineWidth = 2;

ctx.beginPath();
ctx.moveTo(startX, startY);
ctx.lineTo(mouseX, mouseY);
ctx.stroke();

ctx.setLineDash([]);

}
}
function draw() {
drawBackground();
drawHoop();
drawAimLine();
drawPlayer();
drawBall();
}
function gameLoop() {
update();
draw();
requestAnimationFrame(gameLoop);
}
gameLoop();
