<template>
  <div class="p-8 space-y-8">
    <section>
      <header class="mb-6">
        <h2 class="sr-only">Organization Summary</h2>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <StatsCard
          v-for="stat in statsToRender"
          :key="stat.id"
          :icon="stat.icon"
          :label="stat.label"
          :value="stat.value"
          :icon-background="stat.iconBackground"
          :icon-color="stat.iconColor"
          :loading="loading"
          :error="error"
          :clickable="!!stat.route"
          class="hover:border-primary-300 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-fade-slide-up"
          :style="{ animationDelay: stat.animationDelay }"
          @click="handleStatClick(stat)"
        />
      </div>

      <div v-if="showEmptyState" class="mt-6">
        <div class="border border-dashed border-gray-200 rounded-lg p-6 text-center">
          <Icon icon="mdi:database-off" class="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 class="text-lg font-medium text-gray-900">No stats available yet</h3>
          <p class="mt-2 text-sm text-gray-500">Organization activity will populate here once members begin engaging with your program.</p>
        </div>
      </div>
    </section>

    <div class="mt-8">
      <button
        class="w-full md:w-auto btn btn-primary bg-black text-white hover:bg-black/90 border-black flex items-center justify-center gap-2"
        @click="openAwardSheet"
      >
        <Icon icon="mdi:qrcode" class="h-5 w-5" />
        Award Points
      </button>
    </div>
  </div>

  <Transition name="fade">
    <div
      v-if="isAwardSheetOpen"
      class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      @click.self="closeAwardSheet"
    >
      <div
        class="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden"
      >
        <div class="px-6 py-5 flex items-center justify-between border-b border-gray-100">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Award Points</h3>
            <p class="text-sm text-gray-500">Present this code to customers to award points instantly. This code also doubles as a member registration/login link. <router-link to="/admin/qr-codes" class="text-blue-500 hover:text-blue-600">Manage QR Codes</router-link></p>
          </div>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600"
            @click="closeAwardSheet"
            aria-label="Close"
          >
            <Icon icon="mdi:close" class="h-5 w-5" />
          </button>
        </div>

        <div v-if="hasAwardCodes" class="px-6 pt-6 pb-20 overflow-y-auto">
          <div class="flex items-center gap-4 overflow-x-auto pb-4">
            <button
              v-for="(code, index) in awardQRCodes"
              :key="code._id"
              type="button"
              class="px-4 py-2 text-sm rounded-full border transition-all"
              :class="index === selectedAwardIndex ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-300'"
              @click="selectAwardCode(index)"
            >
              {{ code.name || `QR Code ${index + 1}` }}
            </button>
          </div>

          <div class="bg-gray-50 rounded-2xl p-6 flex flex-col items-center gap-4">
            <div class="bg-white p-4 rounded-2xl shadow">
              <QRComponent
                v-if="selectedAwardCode"
                :value="selectedAwardCode.code"
                :size="260"
                :qr-margin="1"
              />
            </div>
            <div class="text-center space-y-1">
              <h4 class="text-lg font-semibold text-gray-900">
                {{ selectedAwardCode?.name || 'Award QR Code' }}
              </h4>
              <p class="text-sm text-gray-500">Worth {{ selectedAwardCode?.points ?? 0 }} points</p>
            </div>
          </div>
        </div>

        <div v-else class="px-6 py-20 text-center text-gray-500">
          <Icon icon="mdi:qrcode-off" class="h-12 w-12 mx-auto mb-4" />
          <p>No award QR codes available yet. Create one to start awarding points.</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import StatsCard from '../../../components/dashboard/StatsCard.vue'
import { useToast } from '../../../plugins/toast'
import QRComponent from '../../../components/QRComponent.vue'

const store = useStore()
const router = useRouter()
const toast = useToast()

const stats = computed(() => store.getters['organization/stats'] ?? [])
const organization = computed(() => store.getters['organization/config'] ?? {})
const awardQRCodes = computed(() => organization.value?.awardQRCodes ?? [])
const configLoading = computed(() => store.getters['organization/loading'])
const configError = computed(() => store.getters['organization/error'])

const loading = computed(() => configLoading.value)
const error = computed(() => configError.value)

const statsToRender = computed(() => {
  const baseStats = stats.value.length ? stats.value : getDefaultStats()
  return baseStats.map((stat, index) => ({
    ...stat,
    ...getStatMeta(stat.id),
    animationDelay: `${index * 100}ms`,
    value: stat.value ?? 0
  }))
})

const showEmptyState = computed(() => !loading.value && !error.value && !stats.value.length)

const hasAwardCodes = computed(() => awardQRCodes.value.length > 0)
const isAwardSheetOpen = ref(false)
const selectedAwardIndex = ref(0)
const selectedAwardCode = computed(() => awardQRCodes.value[selectedAwardIndex.value] ?? null)

onMounted(async () => {
  if (!stats.value.length && !loading.value) {
    try {
      await store.dispatch('organization/fetchConfig')
    } catch (fetchError) {
      console.error('Failed to refresh organization config:', fetchError)
    }
  }
})

watch(
  () => error.value,
  (newError) => {
    if (newError) {
      toast(newError, 'error')
    }
  },
  { immediate: true }
)

watch(awardQRCodes, (codes) => {
  if (!codes.length) {
    isAwardSheetOpen.value = false
    return
  }

  if (selectedAwardIndex.value >= codes.length) {
    selectedAwardIndex.value = 0
  }
})

const openAwardSheet = () => {
  if (!hasAwardCodes.value) {
    toast('No award QR codes available yet. Create one to start awarding points.', 'error')
    return
  }

  selectedAwardIndex.value = 0
  isAwardSheetOpen.value = true
}

const closeAwardSheet = () => {
  isAwardSheetOpen.value = false
}

const selectAwardCode = (index) => {
  selectedAwardIndex.value = index
}

const handleStatClick = (stat) => {
  console.log('stat', stat)
  if (stat.route) {
    const routeConfig = { name: stat.route }
    if (stat.routeQuery) {
      routeConfig.query = stat.routeQuery
    }
    router.push(routeConfig)
  }
}

function getDefaultStats() {
  return [
    {
      id: 'totalMembers',
      label: 'Total Members',
      value: 0,
      route: 'members'
    },
    {
      id: 'activeRewards',
      label: 'Active Rewards',
      value: 0,
      route: 'rewards'
    },
    {
      id: 'pointsIssued',
      label: 'Points Issued',
      value: 0,
      route: 'transactions',
      routeQuery: { type: 'earn' }
    },
    {
      id: 'redemptions',
      label: 'Redemptions',
      value: 0,
      route: 'transactions',
      routeQuery: { type: 'redeem' }
    }
  ]
}

function getStatMeta(id) {
  const meta = {
    totalMembers: {
      icon: 'mdi:account-group',
      iconColor: 'text-blue-500',
      iconBackground: 'bg-blue-50',
      route: 'members'
    },
    activeRewards: {
      icon: 'mdi:gift',
      iconColor: 'text-purple-500',
      iconBackground: 'bg-purple-50',
      route: 'rewards'
    },
    pointsIssued: {
      icon: 'mdi:beer',
      iconColor: 'text-amber-500',
      iconBackground: 'bg-amber-50',
      route: 'transactions',
      routeQuery: { type: 'earn' }
    },
    redemptions: {
      icon: 'mdi:ticket-confirmation',
      iconColor: 'text-green-500',
      iconBackground: 'bg-green-50',
      route: 'transactions',
      routeQuery: { type: 'redeem' }
    }
  }

  return meta[id] || {
    icon: 'mdi:chart-box',
    iconColor: 'text-gray-500',
    iconBackground: 'bg-gray-100'
  }
}

</script>

<style>
.animate-fade-slide-up {
  animation: fadeSlideUp 0.6s ease-out forwards;
  opacity: 0;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
  
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>