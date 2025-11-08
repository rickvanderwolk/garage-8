const express = require('express');
const https = require('https');
const fs = require('fs');
const socketIO = require('socket.io');
const path = require('path');
const os = require('os');

const app = express();

// HTTPS configuration
const serverOptions = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

const server = https.createServer(serverOptions, app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Route for controller
app.get('/controller', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'controller.html'));
});

// Game state
const gameState = {
  ball: {
    x: 400,
    y: 300,
    dx: 8,
    dy: 6,
    radius: 8,
    speed: 10
  },
  players: new Map(), // id -> { team, position, paddleIndex }
  paddles: {
    left: [],  // Array of paddle positions
    right: []  // Array of paddle positions
  },
  scores: {
    left: 0,
    right: 0
  },
  gameStarted: false,
  gameOver: false,
  winner: null,
  startTime: null,
  gameDuration: 180000, // 3 minutes in ms
  winScore: 5,
  lastScoreTime: 0,
  aiEnabled: false,
  aiTeam: null,
  aiDifficulty: 0.3 // 0 = easy, 1 = impossible
};

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const PADDLE_OFFSET = 20;

// Socket connection handling
io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  // Send current game state to new connection
  socket.emit('gameState', getClientGameState());

  // Handle controller connection
  socket.on('joinGame', () => {
    // Determine team (balance teams)
    const leftCount = Array.from(gameState.players.values()).filter(p => p.team === 'left').length;
    const rightCount = Array.from(gameState.players.values()).filter(p => p.team === 'right').length;
    const team = leftCount <= rightCount ? 'left' : 'right';

    // Get paddle index for this team
    const paddleIndex = team === 'left' ? gameState.paddles.left.length : gameState.paddles.right.length;

    // Create player
    const player = {
      id: socket.id,
      team: team,
      position: 0.5, // 0 to 1 (percentage of screen height)
      paddleIndex: paddleIndex
    };

    gameState.players.set(socket.id, player);

    // Add paddle for this player
    const paddleY = CANVAS_HEIGHT / 2;
    if (team === 'left') {
      gameState.paddles.left.push(paddleY);
    } else {
      gameState.paddles.right.push(paddleY);
    }

    console.log(`Player ${socket.id} joined team ${team} as paddle ${paddleIndex}`);

    // Send team assignment to player
    socket.emit('teamAssigned', { team, paddleIndex, totalPlayers: gameState.players.size });

    // Enable AI if only one player and not already enabled
    if (gameState.players.size === 1 && !gameState.aiEnabled) {
      enableAI(team === 'left' ? 'right' : 'left');
    }

    // Broadcast updated player list
    io.emit('playerUpdate', getPlayerList());
    io.emit('gameState', getClientGameState());
  });

  // Handle paddle movement from controller
  socket.on('paddleMove', (data) => {
    const player = gameState.players.get(socket.id);
    if (!player) return;

    // data.position is between 0 and 1
    player.position = Math.max(0, Math.min(1, data.position));

    // Update paddle position
    const paddleY = player.position * (CANVAS_HEIGHT - PADDLE_HEIGHT) + PADDLE_HEIGHT / 2;

    if (player.team === 'left') {
      gameState.paddles.left[player.paddleIndex] = paddleY;
    } else {
      gameState.paddles.right[player.paddleIndex] = paddleY;
    }
  });

  // Handle game start
  socket.on('startGame', () => {
    if (!gameState.gameStarted && canStartGame()) {
      gameState.gameStarted = true;
      gameState.startTime = Date.now();
      gameState.gameOver = false;
      gameState.scores.left = 0;
      gameState.scores.right = 0;
      resetBall();
      io.emit('gameStarted');
      console.log('Game started!');
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const player = gameState.players.get(socket.id);
    if (player) {
      console.log(`Player ${socket.id} disconnected from team ${player.team}`);

      // Remove paddle
      if (player.team === 'left') {
        gameState.paddles.left.splice(player.paddleIndex, 1);
        // Update indices for remaining players
        gameState.players.forEach(p => {
          if (p.team === 'left' && p.paddleIndex > player.paddleIndex) {
            p.paddleIndex--;
          }
        });
      } else {
        gameState.paddles.right.splice(player.paddleIndex, 1);
        gameState.players.forEach(p => {
          if (p.team === 'right' && p.paddleIndex > player.paddleIndex) {
            p.paddleIndex--;
          }
        });
      }

      gameState.players.delete(socket.id);

      // Re-enable AI if only one player left
      if (gameState.players.size === 1) {
        const remainingPlayer = Array.from(gameState.players.values())[0];
        const aiTeam = remainingPlayer.team === 'left' ? 'right' : 'left';
        enableAI(aiTeam);
      } else if (gameState.players.size === 0) {
        disableAI();
      } else if (gameState.players.size > 1) {
        disableAI();
      }

      io.emit('playerUpdate', getPlayerList());
    }
  });
});

// Check if game can start (at least 1 player per team)
function canStartGame() {
  const leftCount = Array.from(gameState.players.values()).filter(p => p.team === 'left').length;
  const rightCount = Array.from(gameState.players.values()).filter(p => p.team === 'right').length;

  // Count AI as a team member
  const leftTotal = leftCount + (gameState.aiEnabled && gameState.aiTeam === 'left' ? 1 : 0);
  const rightTotal = rightCount + (gameState.aiEnabled && gameState.aiTeam === 'right' ? 1 : 0);

  return leftTotal > 0 && rightTotal > 0;
}

// Get player list for clients
function getPlayerList() {
  const players = Array.from(gameState.players.values()).map(p => ({
    id: p.id,
    team: p.team,
    paddleIndex: p.paddleIndex
  }));

  const leftCount = players.filter(p => p.team === 'left').length + (gameState.aiEnabled && gameState.aiTeam === 'left' ? 1 : 0);
  const rightCount = players.filter(p => p.team === 'right').length + (gameState.aiEnabled && gameState.aiTeam === 'right' ? 1 : 0);

  return {
    players,
    leftCount,
    rightCount,
    canStart: canStartGame(),
    aiEnabled: gameState.aiEnabled,
    aiTeam: gameState.aiTeam
  };
}

// Get game state for clients
function getClientGameState() {
  const timeRemaining = gameState.startTime
    ? Math.max(0, gameState.gameDuration - (Date.now() - gameState.startTime))
    : gameState.gameDuration;

  return {
    ball: gameState.ball,
    paddles: gameState.paddles,
    scores: gameState.scores,
    gameStarted: gameState.gameStarted,
    gameOver: gameState.gameOver,
    winner: gameState.winner,
    timeRemaining,
    canStart: canStartGame()
  };
}

// Reset ball to center
function resetBall() {
  gameState.ball.x = CANVAS_WIDTH / 2;
  gameState.ball.y = CANVAS_HEIGHT / 2;

  // Random direction
  const angle = (Math.random() - 0.5) * Math.PI / 3; // -30 to 30 degrees
  const direction = Math.random() < 0.5 ? 1 : -1;

  gameState.ball.dx = Math.cos(angle) * gameState.ball.speed * direction;
  gameState.ball.dy = Math.sin(angle) * gameState.ball.speed;
}

// Enable AI opponent
function enableAI(team) {
  if (gameState.aiEnabled) return;

  gameState.aiEnabled = true;
  gameState.aiTeam = team;

  // Add AI paddle
  const paddleY = CANVAS_HEIGHT / 2;
  if (team === 'left') {
    gameState.paddles.left.push(paddleY);
  } else {
    gameState.paddles.right.push(paddleY);
  }

  console.log(`AI enabled on ${team} team`);
  io.emit('playerUpdate', getPlayerList());
}

// Disable AI opponent
function disableAI() {
  if (!gameState.aiEnabled) return;

  const team = gameState.aiTeam;

  // Remove AI paddle (it's always the last one)
  if (team === 'left' && gameState.paddles.left.length > 0) {
    gameState.paddles.left.pop();
  } else if (team === 'right' && gameState.paddles.right.length > 0) {
    gameState.paddles.right.pop();
  }

  gameState.aiEnabled = false;
  gameState.aiTeam = null;

  console.log('AI disabled');
}

// AI update tracking (throttle AI calculations)
let lastAIUpdate = 0;
const AI_UPDATE_INTERVAL = 50; // Update AI every 50ms (20 Hz)

// Update AI paddle position
function updateAI() {
  if (!gameState.aiEnabled || !gameState.gameStarted) return;

  // Throttle AI updates to 20 Hz for performance
  const now = Date.now();
  if (now - lastAIUpdate < AI_UPDATE_INTERVAL) return;
  lastAIUpdate = now;

  const team = gameState.aiTeam;
  const isLeft = team === 'left';

  // Get AI paddle index (always last paddle)
  const paddleIndex = isLeft ? gameState.paddles.left.length - 1 : gameState.paddles.right.length - 1;
  if (paddleIndex < 0) return;

  // Target position: follow the ball
  let targetY = gameState.ball.y;

  // Add some prediction based on ball velocity
  const predictFrames = 10;
  targetY += gameState.ball.dy * predictFrames;

  // Add difficulty: less accurate = more offset
  const maxError = (1 - gameState.aiDifficulty) * 100;
  const error = (Math.random() - 0.5) * maxError;
  targetY += error;

  // Clamp to screen bounds
  targetY = Math.max(PADDLE_HEIGHT / 2, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT / 2, targetY));

  // Smooth movement (not instant)
  const currentY = isLeft ? gameState.paddles.left[paddleIndex] : gameState.paddles.right[paddleIndex];
  const speed = 16 * gameState.aiDifficulty; // Doubled speed to compensate for 30 FPS
  const diff = targetY - currentY;
  const newY = currentY + Math.sign(diff) * Math.min(Math.abs(diff), speed);

  // Update paddle
  if (isLeft) {
    gameState.paddles.left[paddleIndex] = newY;
  } else {
    gameState.paddles.right[paddleIndex] = newY;
  }
}

// Check ball collision with paddle
function checkPaddleCollision(paddleY, isLeft) {
  const paddleX = isLeft ? PADDLE_OFFSET : CANVAS_WIDTH - PADDLE_OFFSET;
  const ballX = gameState.ball.x;
  const ballY = gameState.ball.y;
  const radius = gameState.ball.radius;

  // Check if ball is at paddle X position
  const atPaddleX = isLeft
    ? (ballX - radius <= paddleX + PADDLE_WIDTH / 2 && ballX > paddleX)
    : (ballX + radius >= paddleX - PADDLE_WIDTH / 2 && ballX < paddleX);

  if (!atPaddleX) return false;

  // Check if ball is within paddle Y range
  const paddleTop = paddleY - PADDLE_HEIGHT / 2;
  const paddleBottom = paddleY + PADDLE_HEIGHT / 2;

  return ballY >= paddleTop && ballY <= paddleBottom;
}

// Game loop
function gameLoop() {
  if (!gameState.gameStarted || gameState.gameOver) return;

  // Update AI
  updateAI();

  // Check for time limit
  const timeRemaining = gameState.gameDuration - (Date.now() - gameState.startTime);
  if (timeRemaining <= 0) {
    endGame();
    return;
  }

  // Don't move ball if in pause after scoring
  if (Date.now() - gameState.lastScoreTime < 2000) {
    return;
  }

  // Move ball
  gameState.ball.x += gameState.ball.dx;
  gameState.ball.y += gameState.ball.dy;

  // Wall collision (top/bottom)
  if (gameState.ball.y - gameState.ball.radius <= 0 ||
      gameState.ball.y + gameState.ball.radius >= CANVAS_HEIGHT) {
    gameState.ball.dy *= -1;
    gameState.ball.y = Math.max(gameState.ball.radius,
                                 Math.min(CANVAS_HEIGHT - gameState.ball.radius, gameState.ball.y));
  }

  // Paddle collision - left side
  for (const paddleY of gameState.paddles.left) {
    if (checkPaddleCollision(paddleY, true) && gameState.ball.dx < 0) {
      gameState.ball.dx *= -1;

      // Add spin based on where ball hits paddle
      const hitPos = (gameState.ball.y - paddleY) / (PADDLE_HEIGHT / 2);
      gameState.ball.dy += hitPos * 2;

      // Limit vertical speed
      gameState.ball.dy = Math.max(-8, Math.min(8, gameState.ball.dy));
      break;
    }
  }

  // Paddle collision - right side
  for (const paddleY of gameState.paddles.right) {
    if (checkPaddleCollision(paddleY, false) && gameState.ball.dx > 0) {
      gameState.ball.dx *= -1;

      const hitPos = (gameState.ball.y - paddleY) / (PADDLE_HEIGHT / 2);
      gameState.ball.dy += hitPos * 2;
      gameState.ball.dy = Math.max(-8, Math.min(8, gameState.ball.dy));
      break;
    }
  }

  // Score detection
  if (gameState.ball.x - gameState.ball.radius <= 0) {
    // Right team scores
    gameState.scores.right++;
    gameState.lastScoreTime = Date.now();
    io.emit('score', { team: 'right', scores: gameState.scores });

    if (gameState.scores.right >= gameState.winScore) {
      endGame();
    } else {
      resetBall();
    }
  } else if (gameState.ball.x + gameState.ball.radius >= CANVAS_WIDTH) {
    // Left team scores
    gameState.scores.left++;
    gameState.lastScoreTime = Date.now();
    io.emit('score', { team: 'left', scores: gameState.scores });

    if (gameState.scores.left >= gameState.winScore) {
      endGame();
    } else {
      resetBall();
    }
  }
}

// End game
function endGame() {
  gameState.gameOver = true;
  gameState.gameStarted = false;

  if (gameState.scores.left > gameState.scores.right) {
    gameState.winner = 'left';
  } else if (gameState.scores.right > gameState.scores.left) {
    gameState.winner = 'right';
  } else {
    gameState.winner = 'draw';
  }

  io.emit('gameOver', {
    winner: gameState.winner,
    scores: gameState.scores
  });

  console.log(`Game over! Winner: ${gameState.winner}`);
}

// Update game state to all clients
function broadcastGameState() {
  // Only broadcast if there are connected clients
  if (gameState.players.size === 0 && !gameState.aiEnabled) return;

  io.emit('gameState', getClientGameState());
}

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Start game loop (30 FPS - reduced for better performance)
setInterval(gameLoop, 1000 / 30);

// Broadcast game state (20 FPS to reduce network traffic)
setInterval(broadcastGameState, 1000 / 20);

server.listen(PORT, () => {
  const localIP = getLocalIP();
  console.log('\n=================================');
  console.log('🎾 MULTIPLAYER TENNIS GAME 🎾');
  console.log('=================================\n');
  console.log(`🖥️  Game screen (open on computer):`);
  console.log(`   https://localhost:${PORT}`);
  console.log(`   https://${localIP}:${PORT}\n`);
  console.log(`📱 Controller (open on phone):`);
  console.log(`   https://${localIP}:${PORT}/controller\n`);
  console.log('⚠️  NOTE: You may need to accept the self-signed certificate');
  console.log('    warning on each device (this is safe for local development)\n');
  console.log('=================================\n');
});
