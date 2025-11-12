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
        <label class="block text-sm font-medium text-gray-700">Type</label>
        <input
          v-model.trim="form.type"
          type="text"
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500"
          placeholder="e.g. coin, plaque"
        />
      </div>

      <div class="col-span-2">
        <label class="block text-sm font-medium text-gray-700">Code</label>
        <input
          v-model.trim="form.code"
          type="text"
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500"
          placeholder="Leave blank to auto-generate"
        />
        <p v-if="errors.code" class="mt-1 text-xs text-red-600">{{ errors.code }}</p>
      </div>
    </div>

    <!-- Status Dropdown -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">Status</label>
      
      <!-- Show readonly badge if claimed -->
      <div v-if="form.status === 'claimed'" class="rounded-md border border-emerald-200 bg-emerald-50 p-3">
        <div class="flex items-center gap-2">
          <span class="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
          <span class="text-sm font-medium text-emerald-900 capitalize">Claimed</span>
        </div>
        <p class="mt-1 text-xs text-emerald-700">This QR code has been claimed by an organization and cannot be edited.</p>
      </div>
      
      <!-- Editable dropdown for other statuses -->
      <div v-else class="relative">
        <button
          type="button"
          @click="statusDropdownOpen = !statusDropdownOpen"
          class="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <span class="flex items-center gap-2">
            <span
              :class="[
                'inline-block h-2 w-2 rounded-full',
                statusColors[form.status]
              ]"
            ></span>
            <span class="block truncate capitalize">{{ form.status }}</span>
          </span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <Icon 
              icon="mdi:chevron-down" 
              class="h-5 w-5 text-gray-400 transition-transform duration-200"
              :class="{ 'rotate-180': statusDropdownOpen }"
            />
          </span>
        </button>

        <!-- Dropdown menu -->
        <transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <ul
            v-show="statusDropdownOpen"
            class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <li
              v-for="status in statusOptions"
              :key="status"
              @click="selectStatus(status)"
              class="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-amber-50 transition-colors"
            >
              <span class="flex items-center gap-2">
                <span
                  :class="[
                    'inline-block h-2 w-2 rounded-full',
                    statusColors[status]
                  ]"
                ></span>
                <span :class="['block truncate capitalize', form.status === status ? 'font-semibold' : 'font-normal']">
                  {{ status }}
                </span>
              </span>
              <span
                v-if="form.status === status"
                class="absolute inset-y-0 right-0 flex items-center pr-4 text-amber-600"
              >
                <Icon icon="mdi:check" class="h-5 w-5" />
              </span>
            </li>
          </ul>
        </transition>
      </div>
    </div>

    <!-- Delivery Description (shown only when status is 'delivered') -->
    <div v-if="form.status === 'delivered'" class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">Description of Delivery</label>
      <textarea
        v-model="form.deliveryDescription"
        rows="3"
        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500"
        placeholder="Enter delivery details (e.g., tracking number, recipient, date delivered)"
      ></textarea>
    </div>

    <!-- QR Code Preview -->
    <div class="rounded-lg border border-gray-200 bg-gray-50 p-6">
      <div class="flex flex-col items-center gap-4">
        <p class="text-sm font-medium text-gray-700">QR Code Preview</p>
        <div 
          :class="[
            'transition-opacity duration-200',
            computedValue ? 'opacity-100' : 'opacity-30'
          ]"
        >
          <QRComponent 
            :value="computedValue || 'https://brewtokens.com/onboarding?code=preview'" 
            :size="200" 
          />
        </div>
        <div class="w-full rounded-md border border-dashed border-gray-300 bg-white px-4 py-3">
          <p class="text-xs font-medium text-gray-500 mb-1">Generated URL:</p>
          <p class="break-all text-xs text-gray-700 font-mono">
            {{ computedValue || 'Enter a code to generate URL' }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-3">
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')" :disabled="loading">
        Cancel
      </button>
      <button 
        v-if="form.status !== 'claimed'"
        type="submit" 
        class="btn btn-primary" 
        :disabled="loading"
      >
        <span v-if="loading">Saving…</span>
        <span v-else>{{ submitLabel }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted, onUnmounted } from 'vue'
import type { QRCode } from '@/types/qrCode'
import QRComponent from '@/components/QRComponent.vue'
import { Icon } from '@iconify/vue'

type QRStatus = 'draft' | 'printed' | 'ordered' | 'in-hand' | 'delivered'

interface FormState {
  name: string
  type: string
  code: string
  status: QRStatus
  deliveryDescription: string
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

const statusOptions: QRStatus[] = ['draft', 'printed', 'ordered', 'in-hand', 'delivered']
const statusDropdownOpen = ref(false)

const statusColors: Record<string, string> = {
  'draft': 'bg-gray-400',
  'printed': 'bg-blue-500',
  'ordered': 'bg-yellow-500',
  'in-hand': 'bg-purple-500',
  'delivered': 'bg-green-500',
  'claimed': 'bg-emerald-500'
}

const initial: FormState = reactive({
  name: props.qr?.name ?? '',
  type: props.qr?.type ?? '',
  code: props.qr?.code ?? '',
  status: (props.qr?.status as QRStatus) ?? 'draft',
  deliveryDescription: props.qr?.deliveryDescription ?? ''
})

const form = reactive<FormState>({ ...initial })

const errors = reactive<{ code?: string }>({})

watch(
  () => props.qr,
  (value) => {
    form.name = value?.name ?? ''
    form.type = value?.type ?? ''
    form.code = value?.code ?? ''
    form.status = (value?.status as QRStatus) ?? 'draft'
    form.deliveryDescription = value?.deliveryDescription ?? ''
  },
  { immediate: false }
)

const selectStatus = (status: QRStatus) => {
  form.status = status
  statusDropdownOpen.value = false
  
  // Clear delivery description if status changes from 'delivered'
  if (status !== 'delivered') {
    form.deliveryDescription = ''
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    statusDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const computedValue = computed(() => {
  if (!form.code) {
    return ''
  }
  return `https://brewtokens.com/onboarding?code=${form.code}`
})

watch(
  computedValue,
  (value) => {
    emit('value-change', value)
  },
  { immediate: true }
)

const validate = () => {
  errors.code = undefined
  // Accept empty code; backend will generate it
  return true
}

const submitLabel = computed(() => (props.qr?._id ? 'Save Changes' : 'Create QR Code'))

const normalizePayload = (): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    name: form.name,
    type: form.type,
    status: form.status,
    code: form.code
  }

  // Only include deliveryDescription if status is 'delivered'
  if (form.status === 'delivered' && form.deliveryDescription) {
    payload.deliveryDescription = form.deliveryDescription
  }

  if (!form.code) {
    delete payload.code
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

