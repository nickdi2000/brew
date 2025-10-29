<template>
  <Drawer :show="open" width="max-w-3xl" @close="$emit('close')">
    <template #header>
      <div class="flex items-center gap-3">
        <Icon icon="mdi:qrcode" class="h-6 w-6 text-amber-600" />
        <div>
          <p class="text-sm font-medium text-gray-500">Preview QR Code</p>
          <h3 class="text-lg font-semibold text-gray-900">{{ qr?.name || 'Untitled QR Code' }}</h3>
        </div>
      </div>
    </template>

    <template #content>
      <div v-if="qr" class="space-y-6">
        <div class="flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <QRComponent :size="240" :value="qr.value || qr.qrContent || qr.code" />
          <button
            class="btn btn-secondary"
            type="button"
            @click="$emit('download', qr)"
          >
            <Icon icon="mdi:download" class="h-5 w-5" />
            Download PNG
          </button>
        </div>

        <dl class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div class="rounded-md border border-gray-200 bg-white p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">Code</dt>
            <dd class="mt-1 font-mono text-sm text-gray-800">{{ qr.code }}</dd>
          </div>
          <div class="rounded-md border border-gray-200 bg-white p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">Type</dt>
            <dd class="mt-1 text-sm text-gray-800">{{ qr.type || '—' }}</dd>
          </div>
          <div class="rounded-md border border-gray-200 bg-white p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">Points</dt>
            <dd class="mt-1 text-sm font-semibold text-gray-900">{{ qr.points }}</dd>
          </div>
          <div class="rounded-md border border-gray-200 bg-white p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">Printed</dt>
            <dd class="mt-1 text-sm text-gray-800">{{ qr.printed ? 'Yes' : 'No' }}</dd>
          </div>
          <div class="rounded-md border border-gray-200 bg-white p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">Active</dt>
            <dd class="mt-1 text-sm text-gray-800">{{ qr.isActive ? 'Active' : 'Inactive' }}</dd>
          </div>
          <div class="rounded-md border border-gray-200 bg-white p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">Expires At</dt>
            <dd class="mt-1 text-sm text-gray-800">
              {{ qr.expiresAt ? formatDate(qr.expiresAt) : '—' }}
            </dd>
          </div>
        </dl>

        <div class="rounded-md border border-gray-200 bg-white p-4">
          <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">QR Value</dt>
          <dd class="mt-1 text-sm text-gray-800">
            <code class="break-words text-xs">{{ qr.value || qr.qrContent || qr.code }}</code>
          </dd>
        </div>
      </div>
      <div v-else class="flex flex-col items-center gap-4 py-20">
        <Icon icon="mdi:qrcode-off" class="h-12 w-12 text-gray-300" />
        <p class="text-sm text-gray-500">Select a QR code to preview.</p>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-secondary" type="button" @click="$emit('close')">
        Close
      </button>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Drawer from '@/components/Drawer.vue'
import QRComponent from '@/components/QRComponent.vue'
import type { QRCode } from '@/types/qrCode'

const props = defineProps<{
  open: boolean
  qr?: QRCode | null
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'download', payload: QRCode): void
}>()

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString()
}

</script>

