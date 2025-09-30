<template>
  <div class="coin-container">
    <div 
      class="coin" 
      :style="{ '--flip-duration': `${spinDuration}s` }"
      @click="handleClick"
    >
      <div class="coin-face front">{{ value }}</div>
      <div class="coin-face back">{{ value }}</div>
      <div class="edge">
        <div v-for="i in 36" :key="i" :style="{ '--i': i - 1 }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref } from 'vue';

const props = defineProps({
  value: { type: [Number, String], default: 100 }
});

const spinDuration = ref(3); // Start at 2 seconds

const handleClick = () => {
  // Make it spin 25% faster with each click, but don't go faster than 0.1s
  spinDuration.value = Math.max(0.1, spinDuration.value * 0.75);
};
</script>

<style scoped> .coin-container { margin: 0; padding: 0; perspective: 1000px; width: 150px; height: 150px; }

.coin { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; animation: flip var(--flip-duration, 2s) infinite linear; }

.coin-face { position: absolute; width: 100%; height: 100%; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-family: Arial, sans-serif; font-size: 40px; font-weight: bold; color: #fff; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); background: radial-gradient(circle at 30% 30%, #ffeeba, #ffd700 20%, #d4af37 50%, #b8860b 80%, #a67c00); border: 5px solid #b8860b; box-shadow: 0 0 20px rgba(0, 0, 0, 0.3); backface-visibility: hidden; box-sizing: border-box; overflow: hidden; }

.coin-face::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: repeating-linear-gradient(135deg, transparent 0px, transparent 100px, rgba(255,255,255,0.6) 100px, rgba(255,255,255,0.6) 140px, transparent 140px, transparent 150px, rgba(255,255,255,0.5) 150px, rgba(255,255,255,0.5) 153px, transparent 153px, transparent 160px, rgba(255,255,255,0.7) 160px, rgba(255,255,255,0.7) 163px, transparent 163px, transparent 170px, rgba(255,255,255,0.4) 170px, rgba(255,255,255,0.4) 172px, transparent 172px, transparent 300px ); background-size: 300% 300%; opacity: 0.5; mix-blend-mode: screen; animation: sheen 4s infinite linear; }

.front { transform: translateZ(10px); }

.back { transform: rotateY(180deg) translateZ(10px); }

.back::after { animation-direction: reverse; }

.edge { position: absolute; top: 75px; left: 75px; width: 0; height: 0; transform-style: preserve-3d; transform: rotateX(90deg); }

.edge div { position: absolute; width: 13px; height: 20px; left: -6.5px; top: -10px; background: linear-gradient(to right, #b8860b, #ffd700, #b8860b); transform: rotateY(calc(var(--i) * 10deg)) translateZ(75px); backface-visibility: hidden; }

@keyframes flip { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }

@keyframes sheen { 0% { background-position: 100% 100%; } 100% { background-position: -100% -100%; } }
</style>