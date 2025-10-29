<template>
  <div class="plaque-container">
    <div 
      class="plaque" 
      :style="{ '--spin-duration': `${spinDuration}s` }"
      @click="handleClick"
    >
      <!-- Front face with QR code -->
      <div class="plaque-face front">
        <div class="plaque-border">
          <div class="qr-code-area">
            <div class="qr-grid">
              <!-- Simplified QR code pattern -->
              <div v-for="i in 225" :key="i" class="qr-pixel" :class="getQrPixelClass(i)"></div>
            </div>
            <div class="scan-me-text">SCAN ME</div>
          </div>
        </div>
      </div>
      
      <!-- Back face with decorative text -->
      <div class="plaque-face back">
        <div class="plaque-border">
          <div class="back-text">
            <div class="text-line">EARN</div>
            <div class="text-line">REWARDS</div>
          </div>
        </div>
      </div>
      
      <!-- Edges to create depth -->
      <div class="edge edge-top"></div>
      <div class="edge edge-bottom"></div>
      <div class="edge edge-left"></div>
      <div class="edge edge-right"></div>
      
      <!-- Wooden base that bends back -->
      <div class="wooden-base"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const spinDuration = ref(4);

const handleClick = () => {
  // Make it spin 25% faster with each click, but don't go faster than 0.2s
  spinDuration.value = Math.max(0.2, spinDuration.value * 0.75);
};

// Generate a realistic QR code pattern with finder patterns
const getQrPixelClass = (index) => {
  const row = Math.floor((index - 1) / 15);
  const col = (index - 1) % 15;
  
  // TOP-LEFT FINDER PATTERN (7x7)
  if (row <= 6 && col <= 6) {
    // Outer border (7x7)
    if (row === 0 || row === 6 || col === 0 || col === 6) {
      return 'qr-filled';
    }
    // White ring (space between outer and inner)
    if (row === 1 || row === 5 || col === 1 || col === 5) {
      return '';
    }
    // Inner square (3x3)
    if (row >= 2 && row <= 4 && col >= 2 && col <= 4) {
      return 'qr-filled';
    }
    return '';
  }
  
  // TOP-RIGHT FINDER PATTERN (7x7)
  if (row <= 6 && col >= 8) {
    const localCol = col - 8;
    // Outer border
    if (row === 0 || row === 6 || localCol === 0 || localCol === 6) {
      return 'qr-filled';
    }
    // White ring
    if (row === 1 || row === 5 || localCol === 1 || localCol === 5) {
      return '';
    }
    // Inner square
    if (row >= 2 && row <= 4 && localCol >= 2 && localCol <= 4) {
      return 'qr-filled';
    }
    return '';
  }
  
  // BOTTOM-LEFT FINDER PATTERN (7x7)
  if (row >= 8 && col <= 6) {
    const localRow = row - 8;
    // Outer border
    if (localRow === 0 || localRow === 6 || col === 0 || col === 6) {
      return 'qr-filled';
    }
    // White ring
    if (localRow === 1 || localRow === 5 || col === 1 || col === 5) {
      return '';
    }
    // Inner square
    if (localRow >= 2 && localRow <= 4 && col >= 2 && col <= 4) {
      return 'qr-filled';
    }
    return '';
  }
  
  // Timing patterns (alternating dots)
  if (row === 6 && col >= 8) {
    return col % 2 === 0 ? 'qr-filled' : '';
  }
  if (col === 6 && row >= 8) {
    return row % 2 === 0 ? 'qr-filled' : '';
  }
  
  // Random data pattern for the rest using a deterministic pattern
  const pseudoRandom = (index * 7 + row * 13 + col * 17) % 10;
  return pseudoRandom < 5 ? 'qr-filled' : '';
};
</script>

<style scoped>
.plaque-container {
  margin: 0;
  padding: 0;
  perspective: 1200px;
  width: 180px;
  height: 180px;
}

.plaque {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  animation: rotate3d var(--spin-duration, 4s) infinite linear;
  cursor: pointer;
}

.plaque-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  background: 
    linear-gradient(135deg, 
      #8B4513 0%, 
      #A0522D 20%, 
      #6B3410 40%, 
      #8B4513 60%, 
      #A0522D 80%, 
      #6B3410 100%
    );
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.1),
    inset 0 -2px 4px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

/* Wood grain texture overlay */
.plaque-face::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: 
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.03) 2px,
      rgba(0, 0, 0, 0.03) 4px
    ),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 1px,
      rgba(139, 69, 19, 0.1) 1px,
      rgba(139, 69, 19, 0.1) 2px
    );
  opacity: 0.6;
  pointer-events: none;
}

.front {
  transform: translateZ(15px);
}

.back {
  transform: rotateY(180deg) translateZ(15px);
}

.plaque-border {
  position: absolute;
  inset: 12px;
  border: 3px solid #654321;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    0 1px 2px rgba(255, 255, 255, 0.1);
}

/* QR Code Styling */
.qr-code-area {
  background: rgba(139, 69, 19, 0.15);
  padding: 10px;
  border-radius: 4px;
  box-shadow: 
    inset 0 1px 3px rgba(0, 0, 0, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.qr-grid {
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  grid-template-rows: repeat(15, 1fr);
  gap: 1px;
  background: transparent;
  width: 110px;
  height: 110px;
}

.qr-pixel {
  background: transparent;
  transition: background 0.3s;
}

.qr-pixel.qr-filled {
  background: rgba(245, 245, 245, 0.95);
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
}

.scan-me-text {
  font-family: 'Arial', sans-serif;
  font-size: 11px;
  font-weight: bold;
  color: rgba(245, 245, 245, 0.9);
  letter-spacing: 2px;
  text-shadow: 
    1px 1px 2px rgba(0, 0, 0, 0.5),
    0 0 5px rgba(255, 255, 255, 0.3);
}

/* Back face text styling */
.back-text {
  font-family: 'Georgia', serif;
  font-weight: bold;
  text-align: center;
  color: #FFD700;
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.8),
    0 0 10px rgba(255, 215, 0, 0.5);
}

.text-line {
  font-size: 24px;
  letter-spacing: 3px;
  margin: 8px 0;
}

/* Edge pieces for 3D depth */
.edge {
  position: absolute;
  background: linear-gradient(to right, #654321, #8B4513, #654321);
  backface-visibility: hidden;
}

.edge-top {
  width: 100%;
  height: 30px;
  top: 0;
  left: 0;
  transform-origin: top;
  transform: rotateX(90deg);
  border-radius: 8px 8px 0 0;
}

.edge-bottom {
  width: 100%;
  height: 30px;
  bottom: 0;
  left: 0;
  transform-origin: bottom;
  transform: rotateX(-90deg);
  border-radius: 0 0 8px 8px;
}

.edge-left {
  width: 30px;
  height: 100%;
  left: 0;
  top: 0;
  transform-origin: left;
  transform: rotateY(-90deg);
  border-radius: 8px 0 0 8px;
}

.edge-right {
  width: 30px;
  height: 100%;
  right: 0;
  top: 0;
  transform-origin: right;
  transform: rotateY(90deg);
  border-radius: 0 8px 8px 0;
}

/* Wooden base that bends back */
.wooden-base {
  position: absolute;
  width: 100%;
  height: 40px;
  bottom: -40px;
  left: 0;
  background: linear-gradient(
    135deg, 
    #6B3410 0%, 
    #8B4513 30%, 
    #A0522D 50%, 
    #8B4513 70%, 
    #6B3410 100%
  );
  border-radius: 0 0 8px 8px;
  transform-origin: top;
  transform: rotateX(-70deg);
  box-shadow: 
    0 8px 16px rgba(0, 0, 0, 0.5),
    inset 0 2px 4px rgba(255, 255, 255, 0.1),
    inset 0 -2px 4px rgba(0, 0, 0, 0.3);
}

/* Wood grain texture for base */
.wooden-base::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: 
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.05) 2px,
      rgba(0, 0, 0, 0.05) 4px
    ),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 1px,
      rgba(139, 69, 19, 0.15) 1px,
      rgba(139, 69, 19, 0.15) 2px
    );
  opacity: 0.6;
  pointer-events: none;
  border-radius: 0 0 8px 8px;
}

/* 3D rotation animation */
@keyframes rotate3d {
  0% {
    transform: rotateY(0deg) rotateX(5deg);
  }
  100% {
    transform: rotateY(360deg) rotateX(5deg);
  }
}

/* Hover effect */
.plaque:hover {
  animation-play-state: paused;
}

/* Add subtle shine effect */
.plaque-face::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  animation: shine 6s infinite;
  pointer-events: none;
}

@keyframes shine {
  0%, 100% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}
</style>

