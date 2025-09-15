const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Resize & maintain aspect ratio
function resizeCanvas() {
  const width = canvas.clientWidth;
  const height = width * (500 / 800); // Original ratio
  canvas.width = width;
  canvas.height = height;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Scale constants based on canvas size
let PADDLE_WIDTH, PADDLE_HEIGHT, BALL_RADIUS, PLAYER_X, AI_X, PADDLE_SPEED, BALL_SPEED;
function updateConstants() {
  PADDLE_HEIGHT = canvas.height * 0.2;
  PADDLE_WIDTH = canvas.width * 0.02;
  BALL_RADIUS = canvas.width * 0.02;
  PLAYER_X = canvas.width * 0.05;
  AI_X = canvas.width - PLAYER_X - PADDLE_WIDTH;
  PADDLE_SPEED = canvas.height * 0.015;
  BALL_SPEED = canvas.width * 0.012;
}
updateConstants();

// Game state
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
let playerScore = 0;
let aiScore = 0;

// Touch controls
canvas.addEventListener('touchmove', e => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const touchY = touch.clientY - rect.top;
  playerY = touchY - PADDLE_HEIGHT / 2;
  playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
  e.preventDefault();
}, { passive: false });

// Desktop mouse control for fallback
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT / 2;
  playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}
function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
function drawNet() {
  ctx.strokeStyle = '#888';
  ctx.setLineDash([10, 15]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}
function drawScore() {
  ctx.font = `${canvas.height * 0.1}px Arial`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(playerScore, canvas.width / 4, canvas.height * 0.1);
  ctx.fillText(aiScore, (3 * canvas.width) / 4, canvas.height * 0.1);
}
function draw() {
  drawRect(0, 0, canvas.width, canvas.height, '#222');
  drawNet();
  drawScore();
  drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, '#4CAF50');
  drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, '#E91E63');
  drawCircle(ballX, ballY, BALL_RADIUS, '#FFF');
}
function collidePaddle(px, py) {
  return (
    ballX + BALL_RADIUS > px &&
    ballX - BALL_RADIUS < px + PADDLE_WIDTH &&
    ballY + BALL_RADIUS > py &&
    ballY - BALL_RADIUS < py + PADDLE_HEIGHT
  );
}
function updateAI() {
  const center = aiY + PADDLE_HEIGHT / 2;
  if (ballY < center - 15) aiY -= PADDLE_SPEED * 0.8;
  else if (ballY > center + 15) aiY += PADDLE_SPEED * 0.8;
  aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));
}
function resetBall(direction) {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballVelX = BALL_SPEED * (direction || (Math.random() > 0.5 ? 1 : -1));
  ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}
function update() {
  ballX += ballVelX;
  ballY += ballVelY;

  if (ballY - BALL_RADIUS < 0 || ballY + BALL_RADIUS > canvas.height) ballVelY *= -1;

  if (collidePaddle(PLAYER_X, playerY) && ballVelX < 0) {
    ballVelX *= -1;
    const collidePoint = (ballY - (playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
    ballVelY = BALL_SPEED * collidePoint;
  }

  if (collidePaddle(AI_X, aiY) && ballVelX > 0) {
    ballVelX *= -1;
    const collidePoint = (ballY - (aiY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
    ballVelY = BALL_SPEED * collidePoint;
  }

  if (ballX - BALL_RADIUS < 0) { aiScore++; resetBall(1); }
  if (ballX + BALL_RADIUS > canvas.width) { playerScore++; resetBall(-1); }

  updateAI();
}

function gameLoop() {
  updateConstants(); // Recalculate constants on resize
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();
