const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Settings
let twoPlayer = true; // ⬅ Toggle this to switch between AI or Player 2

// Resize & constants
function resizeCanvas() {
  canvas.width = window.innerWidth * 0.95;
  canvas.height = canvas.width * (500 / 800);
}
function updateConstants() {
  PADDLE_HEIGHT = canvas.height * 0.2;
  PADDLE_WIDTH = canvas.width * 0.02;
  BALL_RADIUS = canvas.width * 0.02;
  PLAYER_X = canvas.width * 0.05;
  AI_X = canvas.width - PLAYER_X - PADDLE_WIDTH;
  PADDLE_SPEED = canvas.height * 0.015;
  BALL_SPEED = canvas.width * 0.012;
}
resizeCanvas();
updateConstants();
window.addEventListener('resize', () => {
  resizeCanvas();
  updateConstants();
});

// Game state
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let player2Y = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = canvas.width / 2, ballY = canvas.height / 2;
let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
let playerScore = 0, player2Score = 0;

// Touch: Left for Player 1, Right for Player 2
canvas.addEventListener('touchmove', e => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  if (x < canvas.width / 2) {
    playerY = y - PADDLE_HEIGHT / 2;
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
  } else if (twoPlayer) {
    player2Y = y - PADDLE_HEIGHT / 2;
    player2Y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, player2Y));
  }
  e.preventDefault();
}, { passive: false });

// Mouse for Player 1 fallback
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const y = e.clientY - rect.top;
  playerY = y - PADDLE_HEIGHT / 2;
  playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

// Keyboard for Player 2
document.addEventListener('keydown', e => {
  if (!twoPlayer) return;
  if (e.key === 'ArrowUp') player2Y -= PADDLE_SPEED * 2;
  if (e.key === 'ArrowDown') player2Y += PADDLE_SPEED * 2;
  player2Y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, player2Y));
});

// Draw helpers
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
  ctx.fillText(player2Score, (3 * canvas.width) / 4, canvas.height * 0.1);
}
function draw() {
  drawRect(0, 0, canvas.width, canvas.height, '#222');
  drawNet();
  drawScore();
  drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, '#4CAF50');
  drawRect(AI_X, player2Y, PADDLE_WIDTH, PADDLE_HEIGHT, '#E91E63');
  drawCircle(ballX, ballY, BALL_RADIUS, '#FFF');
}

// Collision
function collide(px, py) {
  return (
    ballX + BALL_RADIUS > px &&
    ballX - BALL_RADIUS < px + PADDLE_WIDTH &&
    ballY + BALL_RADIUS > py &&
    ballY - BALL_RADIUS < py + PADDLE_HEIGHT
  );
}

// Reset ball
function resetBall(direction) {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballVelX = BALL_SPEED * (direction || (Math.random() > 0.5 ? 1 : -1));
  ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}

// AI movement (if not two-player)
function updateAI() {
  const center = player2Y + PADDLE_HEIGHT / 2;
  if (ballY < center - 15) player2Y -= PADDLE_SPEED * 0.8;
  else if (ballY > center + 15) player2Y += PADDLE_SPEED * 0.8;
  player2Y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, player2Y));
}

// Update
function update() {
  ballX += ballVelX;
  ballY += ballVelY;

  if (ballY - BALL_RADIUS < 0 || ballY + BALL_RADIUS > canvas.height) ballVelY *= -1;

  if (collide(PLAYER_X, playerY) && ballVelX < 0) {
    ballVelX *= -1;
    ballVelY = BALL_SPEED * ((ballY - (playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2));
  }

  if (collide(AI_X, player2Y) && ballVelX > 0) {
    ballVelX *= -1;
    ballVelY = BALL_SPEED * ((ballY - (player2Y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2));
  }

  if (ballX - BALL_RADIUS < 0) { player2Score++; resetBall(1); }
  if (ballX + BALL_RADIUS > canvas.width) { playerScore++; resetBall(-1); }

  if (!twoPlayer) updateAI();
}

// Game loop
function gameLoop() {
  updateConstants();
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();
