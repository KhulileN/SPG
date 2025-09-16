const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

let players = {};
let ball = { x: 400, y: 250, dx: 4, dy: 4 };

io.on('connection', socket => {
  console.log('Player connected:', socket.id);

  // Assign player side
  if (!players.player1) {
    players.player1 = { id: socket.id, paddleY: 200 };
    socket.emit('playerRole', 'player1');
  } else if (!players.player2) {
    players.player2 = { id: socket.id, paddleY: 200 };
    socket.emit('playerRole', 'player2');
  } else {
    socket.emit('full', 'Room is full.');
    return;
  }

  // Receive paddle movement
  socket.on('movePaddle', y => {
    if (players.player1?.id === socket.id) players.player1.paddleY = y;
    if (players.player2?.id === socket.id) players.player2.paddleY = y;
  });

  // Game update loop
  const gameInterval = setInterval(() => {
    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;
    if (ball.y <= 0 || ball.y >= 500) ball.dy *= -1;

    io.emit('gameState', { players, ball });
  }, 1000 / 60);

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    if (players.player1?.id === socket.id) delete players.player1;
    if (players.player2?.id === socket.id) delete players.player2;
    clearInterval(gameInterval);
  });
});

http.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

