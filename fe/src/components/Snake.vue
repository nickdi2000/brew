<template>
    <div class="snake-game">
      <h2 class="game-title">Snake Game</h2>
      <div class="game-container">
        <canvas ref="canvas" :width="canvasSize" :height="canvasSize"></canvas>
        <div class="controls">
          <div class="score-display">
            <Icon icon="mdi:star" class="score-icon" />
            <span class="score" :class="{ 'score-changed': scoreChanged }">{{ score }}</span>
          </div>
          <div class="button-container">
            <button class="btn btn-primary game-btn" @click="startGame" v-if="!isRunning">
              <Icon icon="mdi:play" class="btn-icon" />
              Start Game
            </button>
            <button class="btn btn-secondary game-btn" @click="restartGame" v-if="gameOver">
              <Icon icon="mdi:refresh" class="btn-icon" />
              Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import { Icon } from '@iconify/vue';
  
  const props = defineProps({
    gridSize: { type: Number, default: 20 },
    cellSize: { type: Number, default: 20 }, // Pixels per cell; scale for mobile
    speed: { type: Number, default: 150 } // ms per move
  });
  
  const canvas = ref(null);
  const ctx = ref(null);
  const canvasSize = computed(() => props.gridSize * props.cellSize);
  
  const snake = ref([{ x: 10, y: 10 }]); // Initial position
  const direction = ref({ x: 0, y: -1 }); // Up initially
  const food = ref({ x: Math.floor(Math.random() * props.gridSize), y: Math.floor(Math.random() * props.gridSize) });
  const score = ref(0);
  const scoreChanged = ref(false);
  const isRunning = ref(false);
  const gameOver = ref(false);
  let lastDirection = { x: 0, y: -1 }; // Prevent instant reverse
  let gameLoopId = null;
  
  // Score animation
  function animateScore() {
    scoreChanged.value = true;
    setTimeout(() => {
      scoreChanged.value = false;
    }, 300);
  }
  
  // Directions map for input
  const directions = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }
  };
  
  // Mobile swipe detection
  let touchStartX = 0;
  let touchStartY = 0;
  
  onMounted(() => {
    ctx.value = canvas.value.getContext('2d');
    window.addEventListener('keydown', handleKeydown);
    canvas.value.addEventListener('touchstart', handleTouchStart);
    canvas.value.addEventListener('touchend', handleTouchEnd);
    // Optional: window.addEventListener('resize', resizeCanvas);
  });
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    canvas.value.removeEventListener('touchstart', handleTouchStart);
    canvas.value.removeEventListener('touchend', handleTouchEnd);
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
  });
  
  function handleKeydown(e) {
    const newDir = directions[e.key];
    if (newDir && (newDir.x !== -lastDirection.x || newDir.y !== -lastDirection.y)) {
      direction.value = newDir;
    }
  }
  
  function handleTouchStart(e) {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }
  
  function handleTouchEnd(e) {
    if (!e.changedTouches[0]) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    let newDir;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      newDir = deltaX > 0 ? directions.ArrowRight : directions.ArrowLeft;
    } else {
      newDir = deltaY > 0 ? directions.ArrowDown : directions.ArrowUp;
    }
    if (newDir && (newDir.x !== -lastDirection.x || newDir.y !== -lastDirection.y)) {
      direction.value = newDir;
    }
  }
  
  function startGame() {
    isRunning.value = true;
    gameOver.value = false;
    gameLoop();
  }
  
  function restartGame() {
    snake.value = [{ x: 10, y: 10 }];
    direction.value = { x: 0, y: -1 };
    food.value = { x: Math.floor(Math.random() * props.gridSize), y: Math.floor(Math.random() * props.gridSize) };
    score.value = 0;
    startGame();
  }
  
  function gameLoop() {
    if (!isRunning.value) return;
    setTimeout(() => {
      gameLoopId = requestAnimationFrame(gameLoop);
      update();
      draw();
    }, props.speed);
  }
  
  function update() {
    lastDirection = { ...direction.value };
    const head = { x: snake.value[0].x + direction.value.x, y: snake.value[0].y + direction.value.y };
  
    // Collision checks
    if (head.x < 0 || head.x >= props.gridSize || head.y < 0 || head.y >= props.gridSize ||
        snake.value.some(segment => segment.x === head.x && segment.y === head.y)) {
      isRunning.value = false;
      gameOver.value = true;
      return;
    }
  
    snake.value.unshift(head); // Move forward
  
    // Eat food
    if (head.x === food.value.x && head.y === food.value.y) {
      score.value++;
      animateScore();
      food.value = { x: Math.floor(Math.random() * props.gridSize), y: Math.floor(Math.random() * props.gridSize) };
    } else {
      snake.value.pop(); // Remove tail if not eating
    }
  }
  
  function draw() {
    const ctx = canvas.value.getContext('2d');
    ctx.clearRect(0, 0, canvasSize.value, canvasSize.value);

    // Draw background grid
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvasSize.value, canvasSize.value);
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= props.gridSize; i++) {
      const pos = i * props.cellSize;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, canvasSize.value);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(canvasSize.value, pos);
      ctx.stroke();
    }

    // Draw snake with gradient and rounded corners
    snake.value.forEach((segment, index) => {
      const x = segment.x * props.cellSize;
      const y = segment.y * props.cellSize;
      const size = props.cellSize - 2; // Smaller for gap effect
      
      ctx.fillStyle = index === 0 ? '#2ecc71' : '#27ae60'; // Head different color
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, size, size, 4);
      ctx.fill();
    });

    // Draw food with gradient and glow effect
    const foodX = food.value.x * props.cellSize;
    const foodY = food.value.y * props.cellSize;
    const foodSize = props.cellSize - 4;

    // Glow effect
    ctx.shadowColor = '#e74c3c';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.roundRect(foodX + 2, foodY + 2, foodSize, foodSize, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  </script>
  
  <style>
  .snake-game {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 100vw;
    padding: 2rem;
  }

  .game-title {
    font-size: 2rem;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .game-container {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  canvas {
    border-radius: 0.5rem;
    touch-action: none;
    background: #f8f9fa;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .controls {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .score-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: bold;
    color: #2c3e50;
  }

  .score-icon {
    color: #f1c40f;
    width: 1.5rem;
    height: 1.5rem;
  }

  .score {
    transition: transform 0.3s ease;
  }

  .score-changed {
    transform: scale(1.2);
    color: #27ae60;
  }

  .button-container {
    display: flex;
    gap: 1rem;
  }

  .game-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    transition: transform 0.2s ease;
  }

  .game-btn:hover {
    transform: translateY(-2px);
  }

  .btn-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  @media (max-width: 600px) {
    .snake-game {
      padding: 1rem;
    }

    .game-container {
      padding: 1rem;
    }

    canvas {
      width: 100%;
      height: auto;
    }

    .game-title {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .button-container {
      flex-direction: column;
      width: 100%;
    }

    .game-btn {
      width: 100%;
      justify-content: center;
    }
  }
  </style>