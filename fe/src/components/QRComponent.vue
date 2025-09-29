<template>
  <div class="inline-flex" :style="{ height: size + 'px' }">
    <component
      :is="qrcodeTag"
      :value="safeValue"
      :options="{ width: size, margin: qrMargin }"
      :tag="tag"
      class="block"
      :style="{ width: size + 'px', height: size + 'px' }"
    />
    <div
      v-if="showSignature"
      :style="{ width: blockSize + 'px', height: size + 'px', opacity: signatureOpacity }"
      aria-hidden="true"
      class="flex flex-col"
    >
      <div
        v-for="(on, idx) in signaturePattern"
        :key="idx"
        :style="{
          width: blockSize + 'px',
          height: blockHeight + 'px',
          backgroundColor: on ? '#000' : 'transparent'
        }"
      />
    </div>
  </div>
  
</template>

<script setup>
import { computed } from 'vue'
import VueQrcode from '@chenfengyuan/vue-qrcode'

const props = defineProps({
  value: {
    type: [String, Number],
    required: true,
    default: ''
  },
  size: {
    type: Number,
    default: 256
  },
  tag: {
    type: String,
    default: 'img'
  },
  showSignature: {
    type: Boolean,
    default: false
  },
  signatureOpacity: {
    type: Number,
    default: 1
  },
  qrMargin: {
    // quiet zone around QR modules; set 0 to have modules touch image edge
    type: Number,
    default: 0
  }
})

const qrcodeTag = computed(() => VueQrcode)
const safeValue = computed(() => String(props.value ?? ''))

// Heuristic block width approximating a narrow column
const blockSize = computed(() => {
  const approxModules = 33
  return Math.max(2, Math.round(props.size / approxModules))
})

const rows = computed(() => {
  // Choose row count so blocks fill the exact height
  return Math.max(8, Math.round(props.size / blockSize.value))
})

const blockHeight = computed(() => props.size / rows.value)

// Deterministic lightweight PRNG seeded by the value
function hashString(input) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function nextRand(state) {
  // xorshift32
  let x = state >>> 0
  x ^= x << 13
  x ^= x >>> 17
  x ^= x << 5
  return x >>> 0
}

const signaturePattern = computed(() => {
  const pattern = new Array(rows.value)
  let s = hashString(safeValue.value)
  for (let i = 0; i < rows.value; i++) {
    s = nextRand(s)
    // Make it sparse and discreet: ~35% density
    const bit = (s & 0xffff) / 0x10000 < 0.35
    pattern[i] = bit
  }
  return pattern
})
</script>

<style scoped>
</style>


