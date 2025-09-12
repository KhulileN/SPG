const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const PLAYER_X = 30;
const AI_X = canvas.width - 30 - PADDLE_WIDTH;
const PADDLE_SPEED = 5;
const BALL_SPEED = 6;

// Game state
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
let playerScore = 0;
let aiScore = 0;

// Mouse movement for player paddle
canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    // Clamp paddle to within canvas
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

// Draw functions
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
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
    ctx.font = '36px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(playerScore, canvas.width / 4, 50);
    ctx.fillText(aiScore, 3 * canvas.width / 4, 50);
}

function draw() {
    // Clear
    drawRect(0, 0, canvas.width, canvas.height, '#222');
    drawNet();
    drawScore();

    // Paddles
    drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, '#4CAF50');
    drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, '#E91E63');

    // Ball
    drawCircle(ballX, ballY, BALL_RADIUS, '#FFF');
}

// Collision detection
function collidePaddle(px, py) {
    return (
        ballX + BALL_RADIUS > px &&
        ballX - BALL_RADIUS < px + PADDLE_WIDTH &&
        ballY + BALL_RADIUS > py &&
        ballY - BALL_RADIUS < py + PADDLE_HEIGHT
    );
}

// AI logic: simple follow ball with some delay
function updateAI() {
    const center = aiY + PADDLE_HEIGHT / 2;
    if (ballY < center - 15) {
        aiY -= PADDLE_SPEED * 0.8;
    } else if (ballY > center + 15) {
        aiY += PADDLE_SPEED * 0.8;
    }
    // Clamp
    aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));
}

function resetBall(direction) {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballVelX = BALL_SPEED * (direction || (Math.random() > 0.5 ? 1 : -1));
    ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}

// Game loop
function update() {
    // Move ball
    ballX += ballVelX;
    ballY += ballVelY;

    // Wall collision
    if (ballY - BALL_RADIUS < 0) {
        ballY = BALL_RADIUS;
        ballVelY *= -1;
    }
    if (ballY + BALL_RADIUS > canvas.height) {
        ballY = canvas.height - BALL_RADIUS;
        ballVelY *= -1;
    }

    // Player paddle collision
    if (collidePaddle(PLAYER_X, playerY) && ballVelX < 0) {
        ballX = PLAYER_X + PADDLE_WIDTH + BALL_RADIUS;
        ballVelX *= -1;
        // Add some effect based on hit position
        let collidePoint = (ballY - (playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        ballVelY = BALL_SPEED * collidePoint;
    }

    // AI paddle collision
    if (collidePaddle(AI_X, aiY) && ballVelX > 0) {
        ballX = AI_X - BALL_RADIUS;
        ballVelX *= -1;
        let collidePoint = (ballY - (aiY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        ballVelY = BALL_SPEED * collidePoint;
    }

    // Score
    if (ballX - BALL_RADIUS < 0) {
        aiScore++;
        resetBall(1);
    }
    if (ballX + BALL_RADIUS > canvas.width) {
        playerScore++;
        resetBall(-1);
    }

    // Update AI
    updateAI();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start
gameLoop();