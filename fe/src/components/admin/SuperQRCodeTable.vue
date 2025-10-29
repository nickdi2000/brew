<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Code
          </th>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Name
          </th>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Type
          </th>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Points
          </th>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Printed
          </th>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Active
          </th>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            QR Value
          </th>
          <th scope="col" class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white">
        <tr v-for="qr in qrCodes" :key="qr.id" class="hover:bg-amber-50/40 transition-colors">
          <td class="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
            <span class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              <Icon icon="mdi:qrcode" class="h-4 w-4" />
              {{ qr.code }}
            </span>
          </td>
          <td class="px-4 py-3 text-sm text-gray-700">
            <div class="flex flex-col">
              <span class="font-medium text-gray-900">{{ qr.name || '—' }}</span>
              <span v-if="qr.expiresAt" class="text-xs text-gray-500">Expires {{ formatDate(qr.expiresAt) }}</span>
            </div>
          </td>
          <td class="px-4 py-3 text-sm text-gray-700">
            <span v-if="qr.type" class="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium capitalize text-amber-800">
              {{ qr.type }}
            </span>
            <span v-else class="text-xs text-gray-400">—</span>
          </td>
          <td class="px-4 py-3 text-sm text-gray-700">
            <span class="font-semibold text-gray-900">{{ qr.points }}</span>
          </td>
          <td class="px-4 py-3 text-sm text-gray-700">
            <Icon
              :icon="qr.printed ? 'mdi:printer-check' : 'mdi:printer-off'"
              :class="qr.printed ? 'text-emerald-600' : 'text-gray-400'"
              class="h-5 w-5"
            />
          </td>
          <td class="px-4 py-3 text-sm text-gray-700">
            <span :class="qr.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
              {{ qr.isActive ? 'Active' : 'Inactive' }}
            </span>
          </td>
          <td class="max-w-xs px-4 py-3 text-xs text-gray-600">
            <code class="block truncate" :title="qr.value || qr.qrContent || qr.code">{{ qr.value || qr.qrContent || qr.code }}</code>
          </td>
          <td class="px-4 py-3 text-right text-sm font-medium">
            <div class="flex items-center justify-end gap-2">
              <button
                class="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                @click="$emit('preview', qr)"
              >
                <Icon icon="mdi:eye" class="h-4 w-4" />
                Preview
              </button>
              <button
                class="inline-flex items-center gap-1 rounded-md border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 shadow-sm hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                @click="$emit('edit', qr)"
              >
                <Icon icon="mdi:pencil" class="h-4 w-4" />
                Edit
              </button>
              <button
                class="inline-flex items-center gap-1 rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                @click="$emit('delete', qr)"
              >
                <Icon icon="mdi:trash-can" class="h-4 w-4" />
                Delete
              </button>
              <button
                class="inline-flex items-center gap-1 rounded-md border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                @click="$emit('download', qr)"
              >
                <Icon icon="mdi:download" class="h-4 w-4" />
                Download
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="qrCodes.length === 0" class="flex flex-col items-center gap-3 bg-white py-16">
      <Icon icon="mdi:qrcode-off" class="h-12 w-12 text-gray-300" />
      <p class="text-sm text-gray-500">No preprinted QR codes yet. Create one to get started.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QRCode } from '@/types/qrCode'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

const props = defineProps<{
  qrCodes: Array<QrRow>
}>()

const qrCodes = computed(() => props.qrCodes)

type QrRow = QRCode & {
  id: string
}

defineEmits<{
  (e: 'edit', payload: QrRow): void
  (e: 'delete', payload: QrRow): void
  (e: 'download', payload: QrRow): void
  (e: 'preview', payload: QrRow): void
}>()

const formatDate = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString()
}
</script>

