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
          <QRComponent :size="240" :value="getQRValue(qr)" />
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
            <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</dt>
            <dd class="mt-1 text-sm text-gray-800">{{ qr.name || '—' }}</dd>
          </div>
          <div class="rounded-md border border-gray-200 bg-white p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">Type</dt>
            <dd class="mt-1 text-sm text-gray-800">{{ qr.type || '—' }}</dd>
          </div>
          <div class="rounded-md border border-gray-200 bg-white p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</dt>
            <dd class="mt-1">
              <span 
                :class="getStatusBadgeClass(qr.status || 'draft')" 
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
              >
                <span :class="getStatusDotClass(qr.status || 'draft')" class="inline-block h-1.5 w-1.5 rounded-full"></span>
                {{ qr.status || 'draft' }}
              </span>
            </dd>
          </div>
        </dl>

        <!-- Organization Info (shown only if status is 'claimed') -->
        <div v-if="qr.status === 'claimed' && qr.organization" class="rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <dt class="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-2">Claimed By Organization</dt>
          <dd class="space-y-1">
            <p class="text-sm font-semibold text-emerald-900">{{ qr.organization.name }}</p>
            <p class="text-xs text-emerald-700">Organization Code: <span class="font-mono font-semibold">{{ qr.organization.code }}</span></p>
          </dd>
        </div>

        <!-- Delivery Description (shown only if status is 'delivered' and description exists) -->
        <div v-if="qr.status === 'delivered' && qr.deliveryDescription" class="rounded-md border border-gray-200 bg-white p-4">
          <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">Delivery Description</dt>
          <dd class="mt-2 text-sm text-gray-800 whitespace-pre-wrap">{{ qr.deliveryDescription }}</dd>
        </div>

        <div class="rounded-md border border-gray-200 bg-white p-4">
          <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">Onboarding URL</dt>
          <dd class="mt-1 text-sm text-gray-800">
            <code class="break-words text-xs">{{ getQRValue(qr) }}</code>
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

const getQRValue = (qr: QRCode) => {
  return `https://brewtokens.com/onboarding?code=${qr.code}`
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    'draft': 'bg-gray-100 text-gray-700',
    'printed': 'bg-blue-100 text-blue-700',
    'ordered': 'bg-yellow-100 text-yellow-700',
    'in-hand': 'bg-purple-100 text-purple-700',
    'delivered': 'bg-green-100 text-green-700',
    'claimed': 'bg-emerald-100 text-emerald-700'
  }
  return classes[status] || classes['draft']
}

const getStatusDotClass = (status: string) => {
  const classes: Record<string, string> = {
    'draft': 'bg-gray-500',
    'printed': 'bg-blue-500',
    'ordered': 'bg-yellow-500',
    'in-hand': 'bg-purple-500',
    'delivered': 'bg-green-500',
    'claimed': 'bg-emerald-500'
  }
  return classes[status] || classes['draft']
}

</script>

