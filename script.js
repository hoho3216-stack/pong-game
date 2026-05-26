const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');
const gameStatusDisplay = document.getElementById('gameStatus');

// Game variables
let gameRunning = false;
let gameStarted = false;

// Paddle properties
const paddleHeight = 80;
const paddleWidth = 10;
const paddleSpeed = 6;

const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 5,
    dy: 5,
    speed: 5
};

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (!gameStarted && !gameRunning) {
        gameRunning = true;
        gameStarted = true;
        gameStatusDisplay.textContent = 'Game Running';
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update player paddle position
function updatePlayer() {
    let moveUp = keys['arrowup'] || keys['w'];
    let moveDown = keys['arrowdown'] || keys['s'];
    
    // Use mouse Y if no keys pressed
    if (!moveUp && !moveDown) {
        const targetY = mouseY - player.height / 2;
        const diff = targetY - player.y;
        player.y += diff * 0.1; // Smooth mouse tracking
    } else {
        // Arrow key movement
        if (moveUp) {
            player.y -= paddleSpeed;
        }
        if (moveDown) {
            player.y += paddleSpeed;
        }
    }
    
    // Boundary collision for player
    if (player.y < 0) {
        player.y = 0;
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

// Update computer paddle position (AI)
function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    const speed = 4;
    
    // AI difficulty adjustment - computer tracks the ball with slight delay
    if (computerCenter < ballCenter - 35) {
        computer.y += speed;
    } else if (computerCenter > ballCenter + 35) {
        computer.y -= speed;
    }
    
    // Boundary collision for computer
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
    }
    
    // Paddle collision - Player
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy += hitPos * 3;
        
        // Increase ball speed slightly
        ball.speed += 0.5;
        ball.dx = Math.abs(ball.dx) * (ball.speed / 5);
    }
    
    // Paddle collision - Computer
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy += hitPos * 3;
        
        // Increase ball speed slightly
        ball.speed += 0.5;
        ball.dx = Math.abs(ball.dx) * (ball.speed / 5);
    }
    
    // Left wall (Computer scores)
    if (ball.x - ball.radius < 0) {
        computer.score++;
        computerScoreDisplay.textContent = computer.score;
        resetBall();
    }
    
    // Right wall (Player scores)
    if (ball.x + ball.radius > canvas.width) {
        player.score++;
        playerScoreDisplay.textContent = player.score;
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
    
    // Random direction
    const angle = (Math.random() - 0.5) * Math.PI / 4;
    ball.dx = ball.speed * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = ball.speed * Math.sin(angle);
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'rgba(0, 255, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'rgba(255, 0, 0, 0.7)';
    ctx.shadowBlur = 15;
    ctx.fill();
}

function drawCenter() {
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowColor = 'transparent';
    
    // Draw game elements
    drawCenter();
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
}

// Game loop
function gameLoop() {
    if (gameRunning) {
        updatePlayer();
        updateComputer();
        updateBall();
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();