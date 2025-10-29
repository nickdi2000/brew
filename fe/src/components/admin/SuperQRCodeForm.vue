<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="col-span-1">
        <label class="block text-sm font-medium text-gray-700">Name</label>
        <input
          v-model.trim="form.name"
          type="text"
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500"
          placeholder="Display name"
        />
      </div>

      <div class="col-span-1">
        <label class="block text-sm font-medium text-gray-700">Points</label>
        <input
          v-model.number="form.points"
          type="number"
          min="0"
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500"
          placeholder="0"
          required
        />
        <p v-if="errors.points" class="mt-1 text-xs text-red-600">{{ errors.points }}</p>
      </div>

      <div class="col-span-1">
        <label class="block text-sm font-medium text-gray-700">Type</label>
        <input
          v-model.trim="form.type"
          type="text"
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500"
          placeholder="e.g. coin, plaque"
        />
      </div>

      <div class="col-span-1">
        <label class="block text-sm font-medium text-gray-700">Code</label>
        <input
          v-model.trim="form.code"
          type="text"
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500"
          placeholder="Leave blank to auto-generate"
        />
        <p v-if="errors.code" class="mt-1 text-xs text-red-600">{{ errors.code }}</p>
      </div>

      <div class="col-span-1">
        <label class="block text-sm font-medium text-gray-700">QR Value</label>
        <input
          v-model.trim="form.qrContent"
          type="text"
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500"
          placeholder="Defaults to the code unless specified"
        />
      </div>

      <div class="col-span-1">
        <label class="block text-sm font-medium text-gray-700">Expires At</label>
        <input
          v-model="form.expiresAt"
          type="date"
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <label class="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
        <input
          v-model="form.isActive"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
        />
        Active
      </label>

      <label class="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
        <input
          v-model="form.printed"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
        />
        Printed
      </label>

      <label class="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
        <input
          v-model="form.includePortalValue"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
        />
        Include Points Signature
      </label>
    </div>

    <div class="rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
      <p class="font-medium text-gray-800">Calculated QR Value</p>
      <p class="break-all text-xs text-gray-600">{{ computedValue }}</p>
    </div>

    <div class="flex justify-end gap-3">
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')" :disabled="loading">
        Cancel
      </button>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="loading">Saving…</span>
        <span v-else>{{ submitLabel }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { QRCode } from '@/types/qrCode'

interface FormState {
  name: string
  points: number
  type: string
  code: string
  qrContent: string
  isActive: boolean
  printed: boolean
  includePortalValue: boolean
  expiresAt: string
}

const props = defineProps<{
  qr?: Partial<QRCode>
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', payload: Record<string, unknown>): void
  (e: 'cancel'): void
  (e: 'value-change', value: string): void
}>()

const initial: FormState = reactive({
  name: props.qr?.name ?? '',
  points: props.qr?.points ?? 0,
  type: props.qr?.type ?? '',
  code: props.qr?.code ?? '',
  qrContent: props.qr?.qrContent ?? props.qr?.value ?? props.qr?.code ?? '',
  isActive: props.qr?.isActive ?? true,
  printed: props.qr?.printed ?? false,
  includePortalValue: Boolean(props.qr?.qrContent && props.qr?.qrContent.startsWith('POINTS:')),
  expiresAt: props.qr?.expiresAt ? props.qr?.expiresAt.substring(0, 10) : ''
})

const form = reactive<FormState>({ ...initial })

const errors = reactive<{ points?: string; code?: string }>({})

watch(
  () => props.qr,
  (value) => {
    form.name = value?.name ?? ''
    form.points = value?.points ?? 0
    form.type = value?.type ?? ''
    form.code = value?.code ?? ''
    form.qrContent = value?.qrContent ?? value?.value ?? value?.code ?? ''
    form.isActive = value?.isActive ?? true
    form.printed = value?.printed ?? false
    form.includePortalValue = Boolean(value?.qrContent && value.qrContent.startsWith('POINTS:'))
    form.expiresAt = value?.expiresAt ? value.expiresAt.substring(0, 10) : ''
  },
  { immediate: false }
)

const computedValue = computed(() => {
  if (form.qrContent) {
    return form.qrContent
  }

  if (form.includePortalValue) {
    return `POINTS:${form.points || 0}:${form.code || 'UNASSIGNED'}`
  }

  return form.code || ''
})

watch(
  computedValue,
  (value) => {
    emit('value-change', value)
  },
  { immediate: true }
)

const validate = () => {
  errors.points = undefined
  errors.code = undefined

  if (form.points === undefined || form.points === null || Number.isNaN(form.points)) {
    errors.points = 'Points must be a number'
  } else if (form.points < 0) {
    errors.points = 'Points must be zero or greater'
  }

  if (!form.code && !form.qrContent) {
    // Accept empty; backend will generate code. No error.
  }

  return !errors.points && !errors.code
}

const submitLabel = computed(() => (props.qr?._id ? 'Save Changes' : 'Create QR Code'))

const normalizePayload = (): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    name: form.name,
    points: Number.isFinite(form.points) ? Number(form.points) : 0,
    type: form.type,
    isActive: form.isActive,
    printed: form.printed,
    qrContent: form.qrContent || (form.includePortalValue ? `POINTS:${form.points || 0}:${form.code || 'UNASSIGNED'}` : ''),
    code: form.code,
    expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null
  }

  if (!form.code) {
    delete payload.code
  }

  if (!form.qrContent) {
    delete payload.qrContent
  }

  if (!form.type) {
    delete payload.type
  }

  return payload
}

const handleSubmit = () => {
  if (!validate()) return
  emit('submit', normalizePayload())
}

const loading = computed(() => props.loading ?? false)
</script>

