const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const speedSlider = document.getElementById('speedSlider');
const speedDisplay = document.getElementById('speedDisplay');
const particlesContainer = document.getElementById('particles');

const GRID_SIZE = 40;
const TILE_COUNT_X = 1000 / GRID_SIZE;
const TILE_COUNT_Y = 520 / GRID_SIZE;

let snake = [
    {x: 5, y: 5}
];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameLoop;
let gameSpeed = 1;

highScoreElement.textContent = highScore;

function randomTilePosition() {
    return {
        x: Math.floor(Math.random() * TILE_COUNT_X),
        y: Math.floor(Math.random() * TILE_COUNT_Y)
    };
}

function createFood() {
    food = randomTilePosition();
    while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = randomTilePosition();
    }
}

function createParticleEffect(x, y) {
    const icons = [
        `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="#58cc02"/>
        </svg>`,
        `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386L9.663 17z" stroke="#FFD700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 4L12 14.01l-3-3" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#FF6B6B"/>
            <path d="M8 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
    ];

    const gameRect = canvas.getBoundingClientRect();

    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.innerHTML = icons[Math.floor(Math.random() * icons.length)];

            const offsetX = (Math.random() - 0.5) * 40;
            const offsetY = (Math.random() - 0.5) * 40;

            particle.style.left = (gameRect.left + x * GRID_SIZE + GRID_SIZE/2 + offsetX) + 'px';
            particle.style.top = (gameRect.top + y * GRID_SIZE + GRID_SIZE/2 + offsetY) + 'px';

            particlesContainer.appendChild(particle);

            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 800);
        }, i * 50);
    }
}

function createSnakeParticleEffect() {
    const icons = [
        `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="#58cc02"/>
        </svg>`,
        `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="#FFD700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="#FFD700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="22.08" x2="12" y2="12" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
        </svg>`,
        `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 4L12 14.01l-3-3" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#FF6B6B"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>`,
        `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="#E91E63"/>
        </svg>`
    ];

    const snakeCharacter = document.querySelector('.snake-character');
    const snakeRect = snakeCharacter.getBoundingClientRect();

    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'snake-particle';
            particle.innerHTML = icons[Math.floor(Math.random() * icons.length)];
            particle.style.position = 'fixed';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '1000';
            particle.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))';

            const offsetX = (Math.random() - 0.5) * 200;
            const offsetY = (Math.random() - 0.5) * 200;

            particle.style.left = (snakeRect.left + snakeRect.width/2 + offsetX) + 'px';
            particle.style.top = (snakeRect.top + snakeRect.height/2 + offsetY) + 'px';

            particle.style.animation = 'sparkle 1.2s ease-out forwards';

            document.body.appendChild(particle);

            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1200);
        }, i * 60);
    }
}

function animateSnakeEating() {
    const snakeCharacter = document.querySelector('.snake-character');
    snakeCharacter.style.transform = 'scale(1.1) rotate(5deg)';
    snakeCharacter.style.transition = 'transform 0.3s ease';

    setTimeout(() => {
        snakeCharacter.style.transform = 'scale(1) rotate(-2deg)';
    }, 300);
}

function drawSnakeHead(x, y, direction) {
    const centerX = x * GRID_SIZE + GRID_SIZE / 2;
    const centerY = y * GRID_SIZE + GRID_SIZE / 2;
    const radius = 18; // Larger to fit new grid size

    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 3, 0, 2 * Math.PI);
    ctx.fill();

    let eyeX1, eyeY1, eyeX2, eyeY2;

    switch(direction) {
        case 'right':
            eyeX1 = centerX + 7;
            eyeY1 = centerY - 6;
            eyeX2 = centerX + 7;
            eyeY2 = centerY + 6;
            break;
        case 'left':
            eyeX1 = centerX - 7;
            eyeY1 = centerY - 6;
            eyeX2 = centerX - 7;
            eyeY2 = centerY + 6;
            break;
        case 'up':
            eyeX1 = centerX - 6;
            eyeY1 = centerY - 7;
            eyeX2 = centerX + 6;
            eyeY2 = centerY - 7;
            break;
        case 'down':
            eyeX1 = centerX - 6;
            eyeY1 = centerY + 7;
            eyeX2 = centerX + 6;
            eyeY2 = centerY + 7;
            break;
        default:
            eyeX1 = centerX + 7;
            eyeY1 = centerY - 6;
            eyeX2 = centerX + 7;
            eyeY2 = centerY + 6;
    }

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(eyeX1, eyeY1, 4, 0, 2 * Math.PI);
    ctx.arc(eyeX2, eyeY2, 4, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(eyeX1, eyeY1, 2, 0, 2 * Math.PI);
    ctx.arc(eyeX2, eyeY2, 2, 0, 2 * Math.PI);
    ctx.fill();
}

function getDirection() {
    if (dx === 1) return 'right';
    if (dx === -1) return 'left';
    if (dy === -1) return 'up';
    if (dy === 1) return 'down';
    return 'right';
}

function drawGame() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    snake.forEach((segment, index) => {
        if (index === 0) {
            drawSnakeHead(segment.x, segment.y, getDirection());
        } else {
            const gradient = ctx.createRadialGradient(
                segment.x * GRID_SIZE + GRID_SIZE/2,
                segment.y * GRID_SIZE + GRID_SIZE/2,
                0,
                segment.x * GRID_SIZE + GRID_SIZE/2,
                segment.y * GRID_SIZE + GRID_SIZE/2,
                GRID_SIZE/2
            );
            gradient.addColorStop(0, '#66BB6A');
            gradient.addColorStop(1, '#388E3C');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(
                segment.x * GRID_SIZE + 2,
                segment.y * GRID_SIZE + 2,
                GRID_SIZE - 4,
                GRID_SIZE - 4,
                8
            );
            ctx.fill();
        }
    });

    const mouseSize = 36;
    const mouseX = food.x * GRID_SIZE + (GRID_SIZE - mouseSize) / 2;
    const mouseY = food.y * GRID_SIZE + (GRID_SIZE - mouseSize) / 2;

    ctx.font = `${mouseSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌸', food.x * GRID_SIZE + GRID_SIZE/2, food.y * GRID_SIZE + GRID_SIZE/2);
}

function moveSnake() {
    if (dx === 0 && dy === 0) return;

    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (head.x < 0 || head.x >= TILE_COUNT_X || head.y < 0 || head.y >= TILE_COUNT_Y) {
        gameOver();
        return;
    }

    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        createParticleEffect(food.x, food.y);
        createSnakeParticleEffect();
        animateSnakeEating();
        createFood();

        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
    } else {
        snake.pop();
    }
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'flex';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    speedSlider.disabled = false;
}

function startGame() {
    if (gameRunning && !gamePaused) return;

    if (!gameRunning) {
        snake = [{x: 5, y: 5}];
        dx = 0;
        dy = 0;
        score = 0;
        scoreElement.textContent = score;
        createFood();
        gameOverElement.style.display = 'none';
    }

    gameRunning = true;
    gamePaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    speedSlider.disabled = true;

    const speeds = {1: 300, 2: 200, 3: 150, 4: 100, 5: 50};
    gameLoop = setInterval(() => {
        if (!gamePaused) {
            moveSnake();
            drawGame();
        }
    }, speeds[gameSpeed]);
}

function pauseGame() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;
    if (gamePaused) {
        pauseBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
            </svg>
            Resume
        `;
    } else {
        pauseBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor"/>
            </svg>
            Pause
        `;
    }
    startBtn.disabled = !gamePaused;
}

function restartGame() {
    gameRunning = false;
    gamePaused = false;
    clearInterval(gameLoop);

    snake = [{x: 5, y: 5}];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    gameOverElement.style.display = 'none';
    pauseBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor"/>
        </svg>
        Pause
    `;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    speedSlider.disabled = false;

    drawGame();
}

function updateSpeed() {
    gameSpeed = parseInt(speedSlider.value);
    speedDisplay.textContent = gameSpeed;

    if (gameRunning && !gamePaused) {
        clearInterval(gameLoop);
        const speeds = {1: 300, 2: 200, 3: 150, 4: 100, 5: 50};
        gameLoop = setInterval(() => {
            if (!gamePaused) {
                moveSnake();
                drawGame();
            }
        }, speeds[gameSpeed]);
    }
}

function handleKeyPress(event) {
    const keyPressed = event.keyCode;

    // Game controls
    if (keyPressed === 13) { // Enter - Start game
        if (!gameRunning) {
            startGame();
        }
        return;
    }

    if (keyPressed === 32) { // Space - Pause/Resume
        event.preventDefault();
        if (gameRunning) {
            pauseGame();
        }
        return;
    }

    if (keyPressed === 27) { // Escape - Restart
        restartGame();
        return;
    }

    // Arrow keys for snake direction
    if (!gameRunning || gamePaused) return;

    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === 37 && !goingRight) { // Left arrow
        dx = -1;
        dy = 0;
    }
    if (keyPressed === 38 && !goingDown) { // Up arrow
        dx = 0;
        dy = -1;
    }
    if (keyPressed === 39 && !goingLeft) { // Right arrow
        dx = 1;
        dy = 0;
    }
    if (keyPressed === 40 && !goingUp) { // Down arrow
        dx = 0;
        dy = 1;
    }
}

if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.arcTo(x + width, y, x + width, y + height, radius);
        this.arcTo(x + width, y + height, x, y + height, radius);
        this.arcTo(x, y + height, x, y, radius);
        this.arcTo(x, y, x + width, y, radius);
        this.closePath();
    };
}

// Info tooltip functionality
const infoBtn = document.getElementById('infoBtn');
const infoTooltip = document.getElementById('infoTooltip');

function toggleInfoTooltip() {
    infoTooltip.classList.toggle('show');
}

function hideInfoTooltip() {
    infoTooltip.classList.remove('show');
}

infoBtn.addEventListener('click', toggleInfoTooltip);
document.addEventListener('click', (e) => {
    if (!infoBtn.contains(e.target) && !infoTooltip.contains(e.target)) {
        hideInfoTooltip();
    }
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);
speedSlider.addEventListener('input', updateSpeed);
document.addEventListener('keydown', handleKeyPress);

createFood();
drawGame();