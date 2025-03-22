document.addEventListener('DOMContentLoaded', () => {
    // Get elements from DOM
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const startButton = document.getElementById('start-btn');
    const resetButton = document.getElementById('reset-btn');
    const easyButton = document.getElementById('easy');
    const mediumButton = document.getElementById('medium');
    const hardButton = document.getElementById('hard');

    // Game constants
    const GRID_SIZE = 20;
    const CANVAS_SIZE = 400;
    
    // Set canvas size
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // Game variables
    let snake = [];
    let food = {};
    let dx = GRID_SIZE;
    let dy = 0;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameInterval;
    let isGameRunning = false;
    let gameSpeed = 150; // Default speed (Easy)
    let difficulty = 'easy';

    // Initialize the game
    function initGame() {
        snake = [
            { x: 5 * GRID_SIZE, y: 10 * GRID_SIZE },
            { x: 4 * GRID_SIZE, y: 10 * GRID_SIZE },
            { x: 3 * GRID_SIZE, y: 10 * GRID_SIZE }
        ];
        score = 0;
        scoreElement.textContent = score;
        highScoreElement.textContent = highScore;
        createFood();
        
        // Clear previous interval if any
        if (gameInterval) {
            clearInterval(gameInterval);
        }
    }

    // Create food at random position
    function createFood() {
        food = {
            x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE,
            y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE
        };

        // Ensure food doesn't appear on the snake
        snake.forEach(segment => {
            if (segment.x === food.x && segment.y === food.y) {
                createFood();
            }
        });
    }

    // Draw snake and food
    function draw() {
        // Clear canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw snake
        snake.forEach((segment, index) => {
            ctx.fillStyle = 'limegreen';
            ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
            
            // Draw border for each segment
            ctx.strokeStyle = 'darkgreen';
            ctx.strokeRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
        });

        // Draw food
        ctx.fillStyle = 'limegreen';
        ctx.fillRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
    }

    // Update game state
    function update() {
        // Create new head based on direction
        const head = { 
            x: snake[0].x + dx, 
            y: snake[0].y + dy 
        };

        // Add new head to the beginning of snake array
        snake.unshift(head);

        // Check if snake eats food
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;
            
            // Update high score if needed
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            createFood();
        } else {
            // Remove tail if no food eaten
            snake.pop();
        }
    }

    // Check for game over conditions
    function checkCollision() {
        const head = snake[0];

        // Check wall collision
        if (
            head.x < 0 || 
            head.x >= CANVAS_SIZE || 
            head.y < 0 || 
            head.y >= CANVAS_SIZE
        ) {
            return true;
        }

        // Check self collision (starting from index 1 to skip head)
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }

        return false;
    }

    // Main game loop
    function gameLoop() {
        if (checkCollision()) {
            clearInterval(gameInterval);
            isGameRunning = false;
            alert(`Game Over! Your score is ${score}`);
            return;
        }

        update();
        draw();
    }

    // Handle keyboard controls
    function handleKeydown(e) {
        if (!isGameRunning) return;

        // Prevent reverse direction
        switch (e.key) {
            case 'ArrowUp':
                if (dy === 0) {
                    dx = 0;
                    dy = -GRID_SIZE;
                }
                break;
            case 'ArrowDown':
                if (dy === 0) {
                    dx = 0;
                    dy = GRID_SIZE;
                }
                break;
            case 'ArrowLeft':
                if (dx === 0) {
                    dx = -GRID_SIZE;
                    dy = 0;
                }
                break;
            case 'ArrowRight':
                if (dx === 0) {
                    dx = GRID_SIZE;
                    dy = 0;
                }
                break;
        }
    }

    // Set difficulty
    function setDifficulty(level) {
        difficulty = level;
        
        // Remove active class from all buttons
        easyButton.classList.remove('active');
        mediumButton.classList.remove('active');
        hardButton.classList.remove('active');
        
        // Set speed based on difficulty
        switch(level) {
            case 'easy':
                gameSpeed = 150;
                easyButton.classList.add('active');
                break;
            case 'medium':
                gameSpeed = 100;
                mediumButton.classList.add('active');
                break;
            case 'hard':
                gameSpeed = 60;
                hardButton.classList.add('active');
                break;
        }
        
        // Restart game interval if game is running
        if (isGameRunning) {
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    }

    // Start game
    function startGame() {
        if (!isGameRunning) {
            initGame();
            isGameRunning = true;
            dx = GRID_SIZE;
            dy = 0;
            gameInterval = setInterval(gameLoop, gameSpeed);
            startButton.textContent = 'Pause';
        } else {
            clearInterval(gameInterval);
            isGameRunning = false;
            startButton.textContent = 'Resume';
        }
    }

    // Reset game
    function resetGame() {
        clearInterval(gameInterval);
        isGameRunning = false;
        startButton.textContent = 'Start Game';
        initGame();
        draw();
    }

    // Event listeners
    document.addEventListener('keydown', handleKeydown);
    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetGame);
    
    // Difficulty buttons
    easyButton.addEventListener('click', () => setDifficulty('easy'));
    mediumButton.addEventListener('click', () => setDifficulty('medium'));
    hardButton.addEventListener('click', () => setDifficulty('hard'));

    // Initialize and show game board
    initGame();
    draw();
}); 