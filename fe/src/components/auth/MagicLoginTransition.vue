<template>
  <div class="min-h-screen flex items-center justify-center bg-amber-50 px-4">
    <div class="w-full max-w-sm">
      <div class="bg-white shadow-xl rounded-2xl p-8 space-y-6 text-center">
        <Icon icon="mdi:beer" class="mx-auto h-12 w-12 text-amber-500" />
        <h1 class="text-2xl font-semibold text-gray-900">Logging you in…</h1>
        <p class="text-sm text-gray-600">Hold tight while we get your admin portal ready.</p>
        <div class="relative h-24 flex items-center justify-center">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="h-20 w-20 rounded-full border-4 border-amber-200" />
          </div>
          <div class="absolute inset-0 flex items-center justify-center animate-spin">
            <div class="h-20 w-20 rounded-full border-4 border-amber-500 border-t-transparent" />
          </div>
          <div class="relative z-10 flex flex-col items-center gap-1">
            <Icon icon="mdi:coffee" class="h-8 w-8 text-amber-600 animate-bounce" />
            <span class="text-xs font-medium text-gray-500 tracking-wide">Brewing session</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
</script>
