<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
        <p class="mt-4 text-gray-500 animate-pulse">Loading QR codes...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-white border-l-4 border-red-500 p-4 rounded-lg max-w-sm shadow-lg">
        <div class="flex items-center">
          <Icon icon="mdi:alert" class="h-5 w-5 text-red-500 flex-shrink-0" />
          <p class="ml-3 text-sm text-gray-700">{{ errorMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="flex flex-col items-center p-4 sm:p-6">
      <!-- Success State -->
      <div v-if="showCoinSuccess" class="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
        <div class="w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
          <div class="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-green-100">
            <div class="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 pt-8">
              <!-- Decorative elements -->
              <div class="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-green-200/30 blur-2xl"></div>
              <div class="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-emerald-300/20 blur-3xl"></div>
              
              <!-- Success Icon with Animated Ring -->
              <div class="relative w-24 h-24 mx-auto mb-6">
                <div class="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 animate-spin blur" style="animation-duration: 3s;"></div>
                <div class="absolute inset-1 rounded-full bg-white"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <Icon icon="mdi:check-circle" class="h-16 w-16 text-green-500" />
                </div>
              </div>

              <!-- Points Counter -->
              <div class="text-center mb-2">
                <div class="inline-flex items-center justify-center px-6 py-2 rounded-full bg-green-600 text-white text-lg font-medium shadow-lg shadow-green-600/20">
                  <Icon icon="mdi:star" class="h-6 w-6 mr-2" /> Awesome!
                </div>
              </div>
              <div class="text-center mb-4">
                <div 
                  class="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500 tabular-nums"
                  :class="{
                    'animate-points-pop': showCoinSuccess
                  }"
                >
                  +{{ displayPoints }}
                </div>
                <div class="text-lg text-green-700 mt-2 font-medium tracking-wide">POINTS EARNED</div>
              </div>

              <!-- Coin Animation -->
              <div class="h-64 relative overflow-hidden mb-8 flex justify-center items-center">
                <CoinFlip :value="displayPoints" />
              </div>

              <!-- Text content -->
              <div class="relative px-8 pb-8 text-center">
                <p class="text-gray-600 mb-8 text-sm">
                  {{ alert.message }}
                </p>
                <div class="flex flex-col gap-4">
                  <button
                    @click="goBackToPortal"
                    class="w-full btn btn-primary px-6 py-4 rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-400 active:scale-[0.98] transition-all duration-200 shadow-xl shadow-green-600/20 text-lg font-medium group"
                  >
                    <Icon icon="mdi:home" class="h-6 w-6 mr-2 inline group-hover:-translate-y-0.5 transition-transform" /> Return to Portal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Back Button Header -->
      <div v-if="!showCoinSuccess" class="w-full max-w-md mb-6 flex items-center">
        <button
          @click="goBackToPortal"
          class="inline-flex items-center px-4 py-2 text-gray-700 bg-white rounded-xl border-2 border-black/10 shadow-md hover:bg-gray-50 hover:shadow-lg ring-1 ring-black/5 transition-all duration-200 group"
        >
          <Icon icon="mdi:arrow-left" class="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Portal
        </button>
      </div>

      <!-- Main Content (Camera or Error) -->
      <div v-if="!showCoinSuccess">
        <!-- Error State -->
        <div v-if="alert.show && alert.type === 'error'" class="w-full max-w-md mb-8 transform">
          <div class="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-red-400/20 ring-1 ring-black/5">
            <div class="relative aspect-[4/3] bg-gradient-to-br from-red-50 via-red-50 to-red-100">
              <!-- Decorative background elements -->
              <div class="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-red-200/30 blur-2xl"></div>
              <div class="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-red-300/20 blur-3xl"></div>

              <div class="absolute inset-0 flex flex-col items-center justify-center p-6">
                <!-- Large Back Button at Top -->
                <div class="absolute top-6 left-6">
                  <button
                    @click="goBackToPortal"
                    class="group flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    <div class="relative">
                      <div class="absolute inset-0 rounded-full bg-red-100 blur-sm group-hover:bg-red-200 transition-colors duration-200"></div>
                      <div class="relative bg-white rounded-full p-3 shadow-lg group-hover:shadow-xl transition-all duration-200">
                        <Icon icon="mdi:arrow-left" class="h-8 w-8 group-hover:-translate-x-1 transition-transform duration-200" />
                      </div>
                    </div>
                    <span class="ml-3 text-lg font-medium">Back</span>
                  </button>
                </div>

                <!-- Error Icon with Animated Ring -->
                <div class="relative w-32 h-32 mb-8">
                  <div class="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-spin blur" style="animation-duration: 3s;"></div>
                  <div class="absolute inset-1 rounded-full bg-white"></div>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <Icon icon="mdi:alert-circle" class="h-20 w-20 text-red-500" />
                  </div>
                </div>

                <!-- Error Message -->
                <div class="text-center mb-8">
                  <h3 class="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    Invalid QR Code
                  </h3>
                  <div class="space-y-2 text-gray-600">
                    <p class="text-xl">
                      This code wasn't recognized by our system.
                    </p>
                    <p class="text-lg text-gray-500">
                      Please try another code or contact our staff for assistance.
                    </p>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col items-center gap-4 w-full max-w-sm">
                  <button
                    @click="resetCamera"
                    class="w-full btn btn-primary px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-red-600/20 text-lg font-medium"
                  >
                    <Icon icon="mdi:camera" class="h-6 w-6 mr-2 inline" />
                    Try Another Code
                  </button>
                  <button
                    @click="goBackToPortal"
                    class="w-full btn btn-secondary px-6 py-3 rounded-xl bg-white text-red-700 border-2 border-red-200 hover:bg-red-50 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-red-100/50 text-lg font-medium"
                  >
                    <Icon icon="mdi:home" class="h-6 w-6 mr-2 inline" />
                    Return to Portal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Camera Scanner -->
        <div v-else>
          <div class="w-full max-w-md mb-8 transform">
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-black/10 ring-1 ring-black/5">
              <!-- Camera View -->
              <div v-if="isCameraActive" class="relative aspect-[4/3] bg-black">
                <div v-if="isIosDevice && !cameraInitialized" class="absolute inset-0 flex items-center justify-center bg-black/75 p-4">
                  <div class="text-center text-white">
                    <Icon icon="mdi:information" class="h-8 w-8 mx-auto mb-3 text-blue-300" />
                    <p class="text-sm mb-4">If the camera view is black, ensure camera access is enabled in Settings > Safari > Camera.</p>
                    <button
                      @click="startCamera"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Continue to Camera
                    </button>
                  </div>
                </div>
                <video ref="videoRef" autoplay playsinline class="w-full h-full object-cover" v-show="!scanError"></video>
                <canvas ref="canvasRef" style="display: none;"></canvas>
                <div v-if="scanError" class="absolute inset-0 flex items-center justify-center bg-black/75">
                  <div class="text-center text-white p-4">
                    <Icon icon="mdi:camera-off" class="h-8 w-8 mx-auto mb-2" />
                    <p>{{ scanError }}</p>
                    <button
                      @click="resetCamera"
                      class="mt-4 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="aspect-[4/3] bg-gray-100 flex items-center justify-center p-4">
                <div class="text-center text-gray-500">
                  <Icon icon="mdi:camera-off" class="h-12 w-12 mx-auto mb-2" />
                  <p>Camera is off</p>
                  <p class="text-sm">Tap the camera icon to begin scanning</p>
                </div>
              </div>
            </div>
          </div>
          <!-- Camera Toggle -->
          <div class="p-4 flex items-center justify-center relative">
            <div class="relative">
              <!-- Rotating gradient border -->
              <div class="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin blur-sm opacity-75" style="animation-duration: 3s;"></div>
              <!-- Inner gap for border effect -->
              <div class="absolute inset-[2px] rounded-full bg-gray-100/95"></div>
              <!-- Button with animated gradient -->
              <button
                @click="toggleCamera"
                class="relative inline-flex items-center justify-center p-4 rounded-full shadow-xl text-white bg-gradient-to-br from-gray-900 via-black to-gray-800 active:scale-95 transition-all duration-300 focus:outline-none group hover:shadow-black/25"
                style="animation: gradientShift 3s ease infinite;"
              >
                <Icon :icon="isCameraActive ? 'mdi:camera-off' : 'mdi:camera'" class="h-8 w-8 relative z-10" />
                <!-- Subtle glow effect -->
                <div class="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 blur group-hover:opacity-100 opacity-0 transition-all duration-300"></div>
                <!-- Extra outer glow for depth -->
                <div class="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl group-hover:opacity-100 opacity-0 transition-all duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Alert Display (hidden when showing coin success) -->
      <div v-if="alert.show && !showCoinSuccess" class="w-full max-w-md mb-6">
        <div 
          :class="[
            'p-4 rounded-xl border-2 flex items-start shadow-md',
            alert.type === 'success' 
              ? 'bg-green-50 border-green-200/50 text-green-800 shadow-green-100' 
              : 'bg-red-50 border-red-200/50 text-red-800 shadow-red-100'
          ]"
        >
          <Icon 
            :icon="alert.type === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'" 
            class="h-5 w-5 mr-3 mt-0.5 flex-shrink-0"
            :class="alert.type === 'success' ? 'text-green-500' : 'text-red-500'"
          />
          <div class="flex-1">
            <p class="text-sm font-medium">{{ alert.message }}</p>
            <p v-if="alert.type === 'success' && alert.points" class="text-sm mt-1">
              You earned <span class="font-semibold">{{ alert.points }} points</span>!
            </p>
          </div>
        </div>
      </div>

      <!-- Scanned Text Display -->
      <div v-if="scannedText && isDevelopment" class="w-full max-w-md mb-8 transform">
        <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-black/10 ring-1 ring-black/5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center">
              <Icon icon="mdi:check-circle" class="h-5 w-5 mr-2 text-green-600" />
              Scanned QR Code
            </h2>
            <button
              @click="clearScannedText"
              class="inline-flex items-center px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <Icon icon="mdi:close" class="h-4 w-4 mr-1" />
              Clear
            </button>
          </div>
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-2xl font-mono text-green-800 break-all leading-relaxed">
              {{ scannedText }}
            </p>
          </div>
        </div>
      </div>

      <!-- Debug Panel -->
      <div class="w-full max-w-md mb-8 hidden transform">
        <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-black/10 ring-1 ring-black/5">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Icon icon="mdi:bug" class="h-5 w-5 mr-2 text-amber-600" />
            Debug Info
          </h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Camera Active:</span>
              <span :class="isCameraActive ? 'text-green-600' : 'text-red-600'">
                {{ isCameraActive ? '✅ Yes' : '❌ No' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>QR Codes Loaded:</span>
              <span :class="qrCodes.length > 0 ? 'text-green-600' : 'text-orange-600'">
                {{ qrCodes.length }} codes
              </span>
            </div>
            <div class="flex justify-between">
              <span>Detection Status:</span>
              <span class="text-blue-600">
                {{ isCameraActive ? '🔍 Scanning...' : '⏸️ Paused' }}
              </span>
            </div>
            <div v-if="scannedText" class="flex justify-between">
              <span>Last Scan:</span>
              <span class="text-green-600 font-mono text-xs">
                {{ scannedText.substring(0, 20) }}...
              </span>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <div class="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-3">
              <div class="flex justify-between">
                <span>Total Logs</span>
                <span class="font-medium">{{ totalDebugEntries }}</span>
              </div>
              <div class="space-y-3 max-h-48 overflow-y-auto">
                <div
                  v-for="summary in debugLogSummaries"
                  :key="summary.channel"
                  class="border border-gray-200 rounded-md bg-white"
                >
                  <div class="px-3 py-2 flex justify-between items-center text-gray-700 bg-gray-100 rounded-t-md">
                    <span class="font-semibold capitalize">{{ summary.channel }}</span>
                    <span class="text-xs">{{ summary.count }} logs</span>
                  </div>
                  <ul class="px-3 py-2 space-y-2">
                    <li
                      v-for="entry in summary.recent"
                      :key="entry.timestamp + entry.message"
                      class="border-l-2 border-amber-300 pl-2"
                    >
                      <p class="font-medium">{{ entry.message }}</p>
                      <p class="text-xs text-gray-400">{{ entry.timestamp }}</p>
                      <pre v-if="entry.payload" class="mt-1 bg-gray-50 p-2 rounded text-[11px] whitespace-pre-wrap">{{ formatPayload(entry.payload) }}</pre>
                    </li>
                    <li v-if="summary.recent.length === 0" class="text-gray-400 italic text-xs">
                      No logs yet.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <button
              @click="testQRCodeDetection"
              class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Icon icon="mdi:flash" class="h-4 w-4 mr-2" />
              Test Detection
            </button>
            <button
              @click="manualTestScan"
              class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Icon icon="mdi:keyboard" class="h-4 w-4 mr-2" />
              Manual Test Scan
            </button>
          </div>
        </div>
      </div>

      <!-- Development Testing Section (hidden when showing coin success) -->
      <div v-if="isDevelopment && !showCoinSuccess" class="w-full max-w-md transform">
        <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-black/10 ring-1 ring-black/5">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Icon icon="mdi:code-braces" class="h-5 w-5 mr-2 text-amber-600" />
            Development Testing
          </h2>
          
          <div v-if="qrCodes.length === 0" class="text-center py-4">
            <p class="text-gray-500">No QR codes found. Create some in the admin panel.</p>
          </div>
          
          <div v-else class="space-y-3">
            <div
              v-for="qr in qrCodes"
              :key="qr._id"
              class="w-full bg-amber-50 rounded-lg overflow-hidden"
            >
              <div class="flex items-center justify-between px-4 py-2">
                <div class="flex items-center">
                  <Icon icon="mdi:qr-code" class="h-5 w-5 text-amber-600 mr-2" />
                  <span class="font-medium text-gray-900">{{ qr.name }}</span>
                </div>
                <span class="text-amber-600 font-semibold">+{{ qr.points }} points</span>
              </div>
              <div class="bg-gray-100 px-4 py-2 border-t border-amber-100">
                <div class="flex items-center justify-between">
                  <code class="text-xs font-mono text-gray-600">{{ qr.code }}</code>
                  <button
                    @click="awardPoints(qr)"
                    class="text-sm px-3 py-1 bg-amber-100 hover:bg-amber-200 rounded-full text-amber-700 transition-colors duration-200"
                    :disabled="awarding"
                  >
                    Test Award
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch, reactive } from 'vue';
import { Icon } from '@iconify/vue';
import { qrCodesApi } from '@/api/qrCodes';
import { addTransaction } from '@/api/transactions';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/browser';
import CoinSuccess from '@/components/CoinSuccess.vue';
import CoinFlip from '@/components/CoinFlip.vue';

const store = useStore();
const route = useRoute();
const router = useRouter();

const alert = reactive({
  show: false,
  type: '', // 'success' or 'error'
  message: '',
  points: 0
});

const showCoinSuccess = computed(() => {
  // Check for both success=true and redeemed=1 query parameters
  const isSuccess = route.query.success === 'true' || route.query.redeemed === '1';
  return isSuccess && (alert.points > 0 || route.query.rewardName);
});

const displayPoints = ref(0);
const hasAnimated = ref(false);

watch(showCoinSuccess, (newValue) => {
  logStage('ui', 'showCoinSuccess changed', { newValue });
  if (newValue && alert.points && !hasAnimated.value) {
    // Animate points counter
    displayPoints.value = 0;
    const duration = 1000; // 1 second
    const startTime = performance.now();
    const targetPoints = alert.points;
    
    const animatePoints = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      displayPoints.value = Math.round(targetPoints * easeOutQuart);
      
      if (progress < 1) {
        requestAnimationFrame(animatePoints);
      } else {
        hasAnimated.value = true;
      }
    };
    
    requestAnimationFrame(animatePoints);
  } else if (!newValue) {
    displayPoints.value = 0;
    hasAnimated.value = false;
  } else if (newValue && hasAnimated.value) {
    // If we're coming back from a refresh, just show the final value
    displayPoints.value = alert.points;
  }
});

const membership = computed(() => store.getters['auth/currentMembership']);
const isSecureContext = ref(window.location.protocol === 'https:');
const isIosDevice = ref(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);

const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const qrCodes = ref([]);
const awarding = ref(false);
const isCameraActive = ref(false);
const cameraInitialized = ref(false);
const scanError = ref('');
const scannedText = ref('');
const videoRef = ref(null);
const canvasRef = ref(null);
let codeReader = null;
let scanInterval = null;

const isDevelopment = computed(() => import.meta.env.VITE_DEBUG === 'true');


const debug = reactive({
  lifecycle: [],
  camera: [],
  detection: [],
  api: [],
  errors: []
});

const logStage = (channel, message, payload, level = 'info') => {
  const timestamp = new Date().toISOString();
  const entry = { timestamp, message, payload: payload ?? null };
  if (debug[channel]) {
    debug[channel].push(entry);
  }
  const formattedMessage = `[Scan Debug][${channel.toUpperCase()}][${timestamp}] ${message}`;
  if (level === 'error') {
    console.error(formattedMessage, payload ?? '');
  } else {
    console.log(formattedMessage, payload ?? '');
  }
};
const logDisposers = [];

const registerLogWatcher = (source, channel, label, options = {}) => {
  const stop = watch(
    source,
    (current, previous) => {
      const eventLabel = previous === undefined ? `${label} initialised` : `${label} changed`;
      logStage(channel, eventLabel, { previous, current });
    },
    { immediate: true, ...options }
  );
  logDisposers.push(stop);
  return stop;
};

const timeouts = new Set();

const registerTimeout = (callback, delay) => {
  const id = setTimeout(() => {
    timeouts.delete(id);
    callback();
  }, delay);
  timeouts.add(id);
  return id;
};

const clearRegisteredTimeouts = () => {
  timeouts.forEach((id) => clearTimeout(id));
  timeouts.clear();
};

const debugLogSummaries = computed(() =>
  Object.entries(debug).map(([channel, entries]) => ({
    channel,
    count: entries.length,
    recent: entries.slice(-5).reverse()
  }))
);

const totalDebugEntries = computed(() =>
  debugLogSummaries.value.reduce((total, channel) => total + channel.count, 0)
);

const detectionLogThrottleMs = 750;
let lastDetectionLogTime = 0;

const throttledDetectionLog = (message, payload, level = 'info') => {
  const now = performance.now();
  if (now - lastDetectionLogTime < detectionLogThrottleMs) {
    return;
  }
  lastDetectionLogTime = now;
  logStage('detection', message, payload, level);
};

const formatPayload = (payload) => {
  try {
    return typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  } catch (error) {
    return String(payload);
  }
};

const fetchQRCodes = async () => {
  logStage('api', 'Fetching QR codes');
  try {
    const response = await qrCodesApi.getQRCodes();
    qrCodes.value = response;
    logStage('api', 'QR codes loaded', {
      count: qrCodes.value.length,
      codes: qrCodes.value.map(q => ({ id: q._id, name: q.name, points: q.points }))
    });
    loading.value = false;
  } catch (err) {
    logStage('api', 'Failed to load QR codes', err, 'error');
    error.value = true;
    errorMessage.value = 'Failed to load QR codes. Please try again.';
    loading.value = false;
  }
};

const toggleCamera = () => {
  logStage('camera', 'Toggle camera requested', { nextState: !isCameraActive.value });
  isCameraActive.value = !isCameraActive.value;
  if (!isCameraActive.value) {
    logStage('camera', 'Camera stopped; clearing scanner state');
    stopCamera();
    scanError.value = '';
    scannedText.value = '';
  } else {
    logStage('camera', 'Camera started');
    startCamera();
  }
};

const startCamera = async () => {
  logStage('camera', 'Starting camera');
  if (!isSecureContext.value) {
    scanError.value = 'Camera access requires a secure connection (HTTPS). Please ensure you\'re accessing this page over HTTPS.';
    logStage('camera', 'Secure context check failed', { protocol: window.location.protocol }, 'error');
    isCameraActive.value = false;
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    videoRef.value.srcObject = stream;
    videoRef.value.play();
    cameraInitialized.value = true;
    scanError.value = '';
    logStage('camera', 'Camera initialized successfully');

    if (!codeReader) {
      codeReader = new BrowserMultiFormatReader();
      codeReader.hints.set(BarcodeFormat.QR_CODE, true);
    }

    startScanning();
  } catch (error) {
    logStage('camera', 'Camera initialization failed', { name: error?.name, message: error?.message }, 'error');
    handleCameraError(error);
    isCameraActive.value = false;
  }
};

const stopCamera = () => {
  logStage('camera', 'Stopping camera');
  if (videoRef.value && videoRef.value.srcObject) {
    const stream = videoRef.value.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    videoRef.value.srcObject = null;
  }
  if (scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }
  cameraInitialized.value = false;
  logStage('camera', 'Camera stopped');
};

const startScanning = () => {
  logStage('detection', 'Starting QR code scanning');
  scanInterval = setInterval(async () => {
    if (videoRef.value && canvasRef.value) {
      const canvas = canvasRef.value;
      const video = videoRef.value;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      try {
        const result = await codeReader.decodeFromCanvas(canvas);
        if (result) {
          onDecode(result.text);
        }
      } catch (err) {
        // Silent error, no need to log every failed scan attempt
      }
    }
  }, 100);
};

const handleCameraError = (error) => {
  if (error.name === 'NotAllowedError') {
    scanError.value = 'Camera permission was denied. Please allow camera access in your browser settings.';
  } else if (error.name === 'NotFoundError') {
    scanError.value = 'No camera found on this device.';
  } else if (error.name === 'NotSupportedError') {
    scanError.value = 'Secure context required (HTTPS, localhost). Please ensure you\'re accessing this page over HTTPS.';
  } else if (error.name === 'NotReadableError') {
    scanError.value = 'Camera already in use by another application.';
  } else if (error.name === 'OverconstrainedError') {
    scanError.value = 'Camera not suitable. There might be a compatibility issue with your device.';
  } else if (error.name === 'StreamApiNotSupportedError') {
    scanError.value = 'Stream API not supported in this browser. If on iOS, ensure you\'re using a supported browser like Safari.';
  } else {
    scanError.value = 'Failed to initialize camera. If on iOS, ensure camera access is enabled in Settings > Safari > Camera.';
    logStage('errors', 'Unhandled camera initialization error', error, 'error');
  }
};

const resetCamera = () => {
  logStage('camera', 'Reset camera invoked');
  scanError.value = '';
  scannedText.value = '';
  isCameraActive.value = false;
  stopCamera();
  registerTimeout(() => {
    isCameraActive.value = true;
    startCamera();
    logStage('camera', 'Camera restarted after reset');
  }, 100);
};

const clearScannedText = () => {
  logStage('detection', 'User cleared scanned text');
  scannedText.value = '';
};

const testQRCodeDetection = () => {
  logStage('detection', 'Manual test detection requested');

  // Simulate different QR codes to test detection
  const testCodes = [
    'POINTS:10:test123',
    'HELLO WORLD',
    'TEST:123:456',
    'QR:CODE:TEST'
  ];

  logStage('detection', 'Available QR codes for testing', qrCodes.value.map(q => q._id));
  logStage('camera', 'Current camera active state for detection test', { isCameraActive: isCameraActive.value });

  // Log current scanner state
  if (isCameraActive.value) {
    logStage('camera', 'Detection test reminder: camera active');
  } else {
    logStage('camera', 'Detection test reminder: camera inactive');
  }

  toast('Check console logs for detection status', 'info');
};

const manualTestScan = () => {
  logStage('detection', 'Manual test scan initiated');

  // Simulate scanning different QR codes to test the processing logic
  const testScans = [
    'POINTS:10:test123',
    'POINTS:5:invalidid',
    'HELLO:WORLD:TEST',
    'INVALID:FORMAT:TEST'
  ];

  logStage('detection', 'Testing QR code processing logic');

  testScans.forEach((testCode, index) => {
    registerTimeout(() => {
      logStage('detection', `Manual test scan ${index + 1}`, { testCode });

      // Simulate the onDecode function logic
      const [prefix, points, qrCodeId] = testCode.split(':');
      throttledDetectionLog(`Parsed manual test scan ${index + 1}`, { prefix, points, qrCodeId });

      if (prefix !== 'POINTS' || !points || !qrCodeId) {
        logStage('detection', `Manual test ${index + 1} invalid format`, { testCode }, 'error');
        toast(`Test ${index + 1}: Invalid format`, 'error');
      } else {
        const qr = qrCodes.value.find(q => q._id === qrCodeId);
        if (qr) {
          logStage('detection', `Manual test ${index + 1} QR code found`, { qr });
          toast(`Test ${index + 1}: Found QR ${qr.name}`, 'success');

          // Simulate storing the scanned text
          scannedText.value = testCode;
          logStage('detection', `Manual test ${index + 1} stored scanned text`, { scannedText: scannedText.value });
        } else {
          logStage('detection', `Manual test ${index + 1} QR code not found`, { qrCodeId }, 'error');
          toast(`Test ${index + 1}: QR not found`, 'error');
        }
      }
    }, (index + 1) * 1000); // Stagger the tests by 1 second
  });
};

const onDecode = async (decodedString) => {
  throttledDetectionLog('QR code decoded', {
    value: decodedString,
    type: typeof decodedString,
    length: decodedString?.length
  });
  
  try {
    // Store the scanned text for display
    scannedText.value = decodedString;
    logStage('detection', 'Stored scanned text', { scannedText: scannedText.value });
    
    // Find matching QR code
    const matchingQR = qrCodes.value.find(qr => qr.code === decodedString);
    
    // Stop camera immediately after any scan
    isCameraActive.value = false;
    logStage('camera', 'Camera stopped after QR detection');

    if (!matchingQR) {
      logStage('detection', 'Invalid or unrecognized QR code', { scannedCode: decodedString });
      alert.type = 'error';
      alert.message = 'Invalid QR Code';
      alert.show = true;
      showCoinSuccess.value = false;
      return;
    }

    logStage('detection', 'Valid QR code found', { 
      qrName: matchingQR.name, 
      points: matchingQR.points 
    });

    await awardPoints(matchingQR);
  } catch (err) {
    logStage('errors', 'QR decode error', err, 'error');
    toast('Failed to process QR code', 'error');
  }
};

const awardPoints = async (qr) => {
  if (awarding.value) {
    logStage('detection', 'Award points skipped; already awarding');
    return;
  }

  // Reset any existing success state
  showCoinSuccess.value = false;
  alert.show = false;

  logStage('detection', 'Award points start', { qrName: qr.name, points: qr.points, code: qr.code });
  logStage('ui', 'Current UI state before award', { showCoinSuccess: showCoinSuccess.value, alert: { ...alert } });
  awarding.value = true;
  const membership = store.getters['auth/currentMembership'];
  logStage('lifecycle', 'Current membership snapshot', { membership });

  if (!(membership?._id || membership?.id)) {
    logStage('errors', 'Member ID missing during award');
    alert.type = 'error';
    alert.message = 'Member ID not found. Please try logging in again.';
    alert.show = true;
    awarding.value = false;
    return;
  }
  const memberId = membership._id || membership.id;
  logStage('detection', 'Resolved member ID for award', { memberId });

  try {
    // Reset alert state
    alert.show = false;
    
    // First verify and redeem the QR code
    logStage('api', 'Verifying and redeeming QR code', {
      memberId,
      code: qr.code
    });
    
    const { default: api } = await import('@/api');
    const organizationCode = route.params.code; // Get organization code from route
    const redeemResponse = await api.post(`/qr-codes/${qr._id}/redeem`, {
      memberId,
      organizationCode,
      code: qr.code // Send the actual QR code value for validation
    });

    if (!redeemResponse.data?.success) {
      throw new Error(redeemResponse.data?.message || 'Failed to redeem QR code');
    }

    const awardedPoints = redeemResponse.data?.data?.points || qr.points;
    const memberPoints = redeemResponse.data?.data?.memberPoints;

    // Record the transaction
    logStage('api', 'Recording points transaction', {
      memberId,
      points: awardedPoints,
      qrCode: qr.code
    });

    await addTransaction(memberId, {
      amount: awardedPoints,
      type: 'earn',
      metadata: {
        description: `QR code: ${qr.name}`,
        qrCodeId: qr._id,
        code: qr.code
      }
    });

    logStage('api', 'Award points success', { 
      qrName: qr.name, 
      points: awardedPoints,
      code: qr.code,
      memberPoints
    });
    
    // Update the membership points in the store
    if (memberPoints !== undefined) {
      store.commit('auth/UPDATE_MEMBERSHIP_POINTS', memberPoints);
    }
    
    // Show coin success animation instead of alert
    alert.type = 'success';
    alert.message = `QR code redeemed successfully! Total points: ${memberPoints || 'Unknown'}`;
    alert.points = awardedPoints;
    
    // Stop camera when showing success animation
    stopCamera();
    isCameraActive.value = false;

    // Set success state after camera is stopped
    logStage('ui', 'Setting success state', { points: awardedPoints, message: alert.message });
    
    // Update route to include success state
    router.replace({ 
      query: { 
        ...route.query,
        success: 'true',
        points: awardedPoints.toString()
      }
    });
    
    logStage('ui', 'Success state set in route', { query: route.query });
  } catch (err) {
    logStage('errors', 'Failed to award points', err, 'error');
    alert.type = 'error';
    alert.message = err.message || 'Failed to award points. Please try again.';
    alert.points = 0;
    alert.show = true;
  } finally {
    awarding.value = false;
  }
};

const resetAfterSuccess = () => {
  logStage('ui', 'Resetting after success animation');
  router.replace({ query: {} }); // Remove success state from route
  alert.show = false;
  scannedText.value = '';
  // Camera will be restarted when user clicks the camera button
};

const goBackToPortal = () => {
  logStage('ui', 'Navigating back to member portal');
  const code = route.params.code;
  router.push(`/members/${code}`);
};

onMounted(async () => {
  logStage('lifecycle', 'Scan page mounted; initializing');
  registerLogWatcher(isCameraActive, 'camera', 'Camera active state');
  registerLogWatcher(scanError, 'camera', 'Scan error state');
  registerLogWatcher(scannedText, 'detection', 'Scanned text state');

  // Check for success state in route
  if ((route.query.success === 'true' && route.query.points) || route.query.redeemed === '1') {
    alert.type = 'success';
    if (route.query.points) {
      alert.points = parseInt(route.query.points, 10);
      alert.message = `QR code redeemed successfully! Total points: ${alert.points}`;
    } else if (route.query.rewardName) {
      alert.points = 1; // Set a non-zero value to trigger success state
      alert.message = `Successfully redeemed: ${decodeURIComponent(route.query.rewardName)}`;
    }
    logStage('lifecycle', 'Restored success state from route', { 
      points: alert.points,
      rewardName: route.query.rewardName 
    });
  }
  try {
    const isAuthenticated = store.getters.isAuthenticated;
    const code = route.params.code;
    logStage('lifecycle', 'Auth status and route code received', { isAuthenticated, code });

    if (!isAuthenticated) {
      logStage('errors', 'User not authenticated; redirecting to code landing', { code });
      router.replace(`/members/${code}`);
      return;
    }

    if (!membership.value) {
      logStage('lifecycle', 'Membership missing; loading by code', { code });
      try {
        const { default: api } = await import('@/api');
        const resp = await api.get(`/memberships/by-code/${code}`);
        const m = resp.data?.data || null;
        if (m) {
          logStage('lifecycle', 'Membership fetched by code', { membership: m });
          store.commit('auth/SET_MEMBERSHIP', m);
        } else {
          logStage('errors', 'Membership lookup returned no result', { code });
          router.replace(`/members/${code}`);
          return;
        }
      } catch (error) {
        logStage('errors', 'Error loading membership by code', error, 'error');
        router.replace(`/members/${code}`);
        return;
      }
    } else {
      logStage('lifecycle', 'Membership already available', { membership: membership.value });
    }

    await fetchQRCodes();
  } finally {
    logStage('lifecycle', 'Component initialization complete');
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  logStage('lifecycle', 'Scan page before unmount; cleaning up');
  logDisposers.forEach((dispose) => dispose());
  logDisposers.length = 0;
  clearRegisteredTimeouts();
  stopCamera(); // Ensure camera is stopped on unmount
});
</script>

<style scoped>
/* Smooth fade+scale for success card */
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 200ms ease;
}
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes points-pop {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.animate-points-pop {
  animation: points-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
