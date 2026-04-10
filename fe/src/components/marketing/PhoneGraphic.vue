<template>
  <div class="phone-scene" :class="{ 'phone-scene--clickable': linkTo }" @click="handleClick">
    <div class="phone-body">
      <!-- Notch -->
      <div class="phone-notch"></div>

      <!-- Screen content -->
      <div class="phone-screen">
        <!-- Header -->
        <div class="screen-header">
          <div class="header-dot"></div>
          <span class="header-title">My Rewards</span>
          <Icon icon="mdi:bell-outline" class="header-icon" />
        </div>

        <!-- Gauge area -->
        <div class="gauge-wrap">
          <svg viewBox="0 0 120 120" class="gauge-svg">
            <circle cx="60" cy="60" r="52" class="gauge-track" />
            <circle cx="60" cy="60" r="52" class="gauge-fill" :style="{ strokeDashoffset: gaugeOffset }" />
          </svg>
          <div class="gauge-label">
            <span class="gauge-value">{{ animatedPoints }}</span>
            <span class="gauge-unit">points</span>
          </div>
        </div>

        <!-- Tier badge -->
        <div class="tier-row">
          <Icon icon="mdi:star-circle" class="tier-icon" />
          <span class="tier-text">Gold Member</span>
        </div>

        <!-- Progress bar to next tier -->
        <div class="progress-section">
          <div class="progress-labels">
            <span>Next reward</span>
            <span class="progress-target">1,000 pts</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar" :style="{ width: barWidth + '%' }"></div>
          </div>
        </div>

        <!-- Recent activity -->
        <div class="activity-section">
          <span class="activity-heading">Recent</span>
          <div v-for="item in recentActivity" :key="item.label" class="activity-row">
            <div class="activity-icon-wrap">
              <Icon :icon="item.icon" class="activity-icon" />
            </div>
            <span class="activity-label">{{ item.label }}</span>
            <span class="activity-pts">+{{ item.pts }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';

const props = defineProps({
  points: { type: Number, default: 750 },
  maxPoints: { type: Number, default: 1000 },
  linkTo: { type: String, default: null },
});

const router = useRouter();

const handleClick = () => {
  if (props.linkTo) {
    router.push(props.linkTo);
  }
};

const animatedPoints = ref(0);
const barWidth = ref(0);

const circumference = 2 * Math.PI * 52;
const gaugeOffset = computed(() => {
  const ratio = animatedPoints.value / props.maxPoints;
  return circumference - circumference * Math.min(ratio, 1);
});

const recentActivity = [
  { label: 'Morning coffee', pts: 25, icon: 'mdi:coffee-outline' },
  { label: 'Saturday brunch', pts: 50, icon: 'mdi:silverware-fork-knife' },
  { label: 'Happy hour', pts: 40, icon: 'mdi:glass-cocktail' },
];

onMounted(() => {
  let start = 0;
  const duration = 1400;
  const target = props.points;
  const barTarget = (target / props.maxPoints) * 100;
  const startTime = performance.now();

  const tick = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);

    animatedPoints.value = Math.round(ease * target);
    barWidth.value = Math.round(ease * barTarget);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
});
</script>

<style scoped>
.phone-scene {
  perspective: 1200px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.phone-scene--clickable {
  cursor: pointer;
}

.phone-scene--clickable .phone-body {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.phone-scene--clickable:hover .phone-body {
  transform: rotateY(-4deg) rotateX(2deg) translateY(-6px) scale(1.02);
  box-shadow:
    0 0 0 3px #4f46e5,
    0 30px 90px -12px rgba(99, 102, 241, 0.35),
    0 12px 40px -8px rgba(0, 0, 0, 0.4);
}

.phone-body {
  position: relative;
  width: 280px;
  height: 560px;
  background: linear-gradient(145deg, #1a1a2e, #16162a);
  border-radius: 40px;
  box-shadow:
    0 0 0 3px #2a2a4a,
    0 25px 80px -12px rgba(99, 102, 241, 0.25),
    0 8px 30px -8px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  transform: rotateY(-8deg) rotateX(4deg);
  animation: phone-float 6s ease-in-out infinite;
}

@keyframes phone-float {
  0%, 100% { transform: rotateY(-8deg) rotateX(4deg) translateY(0); }
  50% { transform: rotateY(-6deg) rotateX(2deg) translateY(-10px); }
}

.phone-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 28px;
  background: #1a1a2e;
  border-radius: 0 0 18px 18px;
  z-index: 10;
}

.phone-screen {
  position: absolute;
  inset: 4px;
  border-radius: 36px;
  background: linear-gradient(180deg, #0f0f23 0%, #1a1a3e 100%);
  padding: 40px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
}

/* Header */
.screen-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #818cf8;
}

.header-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #e0e0ff;
  letter-spacing: 0.02em;
}

.header-icon {
  width: 18px;
  height: 18px;
  color: #6366f1;
}

/* Gauge */
.gauge-wrap {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 4px auto 0;
}

.gauge-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.gauge-track {
  fill: none;
  stroke: #2a2a50;
  stroke-width: 8;
}

.gauge-fill {
  fill: none;
  stroke: url(#gauge-gradient);
  stroke: #818cf8;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 326.73;
  transition: stroke-dashoffset 0.1s ease-out;
}

.gauge-label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.gauge-value {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  letter-spacing: -0.02em;
}

.gauge-unit {
  font-size: 11px;
  font-weight: 500;
  color: #818cf8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 2px;
}

/* Tier */
.tier-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tier-icon {
  width: 16px;
  height: 16px;
  color: #facc15;
}

.tier-text {
  font-size: 12px;
  font-weight: 600;
  color: #facc15;
  letter-spacing: 0.03em;
}

/* Progress */
.progress-section {
  padding: 0 4px;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #8888aa;
  margin-bottom: 6px;
}

.progress-target {
  color: #a5a5cc;
  font-weight: 600;
}

.progress-track {
  height: 6px;
  border-radius: 3px;
  background: #2a2a50;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #6366f1, #a78bfa);
  transition: width 0.1s ease-out;
}

/* Activity */
.activity-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.activity-heading {
  font-size: 10px;
  font-weight: 600;
  color: #6b6b8a;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.activity-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
}

.activity-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-icon {
  width: 15px;
  height: 15px;
  color: #818cf8;
}

.activity-label {
  flex: 1;
  font-size: 12px;
  color: #c0c0e0;
}

.activity-pts {
  font-size: 12px;
  font-weight: 700;
  color: #34d399;
}

/* Responsive */
@media (max-width: 640px) {
  .phone-body {
    width: 240px;
    height: 480px;
    border-radius: 32px;
  }

  .phone-screen {
    border-radius: 28px;
    padding: 36px 16px 16px;
    gap: 10px;
  }

  .gauge-wrap {
    width: 110px;
    height: 110px;
  }

  .gauge-value {
    font-size: 26px;
  }
}
</style>
