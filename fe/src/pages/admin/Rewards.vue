<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <svg class="animate-spin h-8 w-8 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div class="text-center sm:text-left">
          <h2 class="text-2xl font-bold text-gradient-blue font-display">Rewards</h2>
          <div class="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <p class="text-sm text-gray-500">Manage your rewards program offerings.</p>
            <button
              @click="showTemplates = true"
              class="inline-flex items-center justify-center text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              <Icon icon="mdi:view-grid" class="h-4 w-4 mr-1" /> View Templates
            </button>
          </div>
        </div>
        <button
          @click="openCreate"
          class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          <Icon icon="mdi:plus" class="h-5 w-5 mr-2" />
          Create New Reward
        </button>
      </div>

      <!-- Blank Slate -->
    <div v-if="!loading && rewards.length === 0" class="relative overflow-hidden rounded-xl border border-dashed border-gray-300 bg-white">
      <div class="px-6 py-12 sm:px-12 lg:px-16">
        <div class="mx-auto max-w-3xl text-center">
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
            <Icon icon="mdi:gift" class="h-6 w-6 text-amber-600" />
          </div>
          <h3 class="text-2xl font-semibold text-slate-900">Start building your first reward</h3>
          <p class="mt-2 text-slate-500">Create a custom reward or pick a ready‑made template to get started fast.</p>

          <div class="mt-6 grid gap-3 sm:flex sm:flex-row sm:items-center sm:justify-center">
            <button
              @click="openCreate"
              class="btn btn-primary inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <Icon icon="mdi:plus" class="h-5 w-5 mr-2" /> Create custom reward
            </button>
            <button
              @click="showTemplates = true"
              class="btn btn-secondary inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 bg-white text-slate-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Browse templates
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Templates Grid -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2 max-h-0"
      enter-to-class="opacity-100 translate-y-0 max-h-[1000px]"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 max-h-[1000px]"
      leave-to-class="opacity-0 -translate-y-2 max-h-0"
    >
      <div v-if="showTemplates" class="relative overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">Reward Templates</h3>
              <p class="mt-1 text-sm text-slate-500">Choose from our pre-made templates to get started quickly.</p>
            </div>
            <button
              @click="showTemplates = false"
              class="text-gray-400 hover:text-gray-500"
            >
              <span class="sr-only">Close</span>
              <Icon icon="mdi:close" class="h-6 w-6" />
            </button>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              v-for="t in templates"
              :key="t.key"
              type="button"
              @click="selectTemplate(t)"
              class="group relative overflow-hidden rounded-lg border bg-white p-5 text-left shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
            >
              <div class="flex items-start gap-4">
                <div class="flex h-10 w-10 items-center justify-center rounded-md bg-amber-50">
                  <Icon :icon="t.icon" class="h-6 w-6 text-amber-600" />
                </div>
                <div class="">
                  <h4 class="text-base font-semibold text-slate-900">{{ t.title }}</h4>
                  <p class="mt-1 text-sm text-slate-500">{{ t.subtitle }}</p>
                </div>
              </div>
              <div class="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                <div class="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-amber-100"></div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Rewards List -->
    <div class="space-y-4">
      <div class="space-y-4">
        <RewardCard
          v-for="reward in rewards"
          :key="reward._id"
          :reward="reward"
          @edit="editReward"
        />
      </div>
    </div>

    <!-- Drawer -->
    <RewardDrawer
      :show="showDrawer"
      :reward="selectedReward"
      :initialData="initialData"
      @close="closeDrawer"
      @save="handleSave"
    />
  </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import RewardCard from '@/components/rewards/RewardCard.vue';
import RewardDrawer from '@/components/rewards/RewardDrawer.vue';

interface Reward {
  _id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'product' | 'service' | 'discount' | 'experience';
  imageUrl?: string;
  isActive: boolean;
  quantity: number | null;
  expiresAt: string | null;
  organizationId: string;
  redemptionInstructions?: string;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
  isOutOfStock: boolean;
  isAvailable: boolean;
}

const store = useStore();
const router = useRouter();

// State
const showDrawer = ref(false);
const selectedReward = ref<Reward | null>(null);
const showTemplates = ref(false);
const initialData = ref<Partial<Reward> | null>(null);

// Check if user is authenticated
const isAuthenticated = computed(() => store.getters.isAuthenticated);

// Computed
const rewards = computed(() => store.getters['rewards/rewardsList']);
const loading = computed(() => store.getters['rewards/isLoading']);

// Predefined templates
const templates = [
  {
    key: 'free-pint',
    title: 'Free Pint',
    subtitle: 'One complimentary pint for members',
    icon: 'mdi:gift',
    data: {
      name: 'Free Pint',
      description: 'Enjoy a complimentary pint on us!',
      type: 'product',
      pointsCost: 100,
      quantity: 0,
      isActive: true
    } as Partial<Reward>
  },
  {
    key: 'ten-off',
    title: '10% Off',
    subtitle: 'Discount on entire order',
    icon: 'mdi:gift',
    data: {
      name: '10% Off',
      description: 'Take 10% off your purchase.',
      type: 'discount',
      pointsCost: 50,
      quantity: 0,
      isActive: true
    } as Partial<Reward>
  },
  {
    key: 'free-app',
    title: 'Free Appetizer',
    subtitle: 'Starter on the house',
    icon: 'mdi:gift',
    data: {
      name: 'Free Appetizer',
      description: 'Choose any appetizer for free.',
      type: 'product',
      pointsCost: 75,
      quantity: 0,
      isActive: true
    } as Partial<Reward>
  },
  {
    key: 'bogo',
    title: 'BOGO Pint',
    subtitle: 'Buy one pint, get one free',
    icon: 'mdi:gift',
    data: {
      name: 'BOGO Pint',
      description: 'Buy one pint, get one free of equal or lesser value.',
      type: 'discount',
      pointsCost: 100,
      quantity: 0,
      isActive: true
    } as Partial<Reward>
  },
];

// Methods
const editReward = (reward: Reward) => {
  selectedReward.value = reward;
  showDrawer.value = true;
};

const closeDrawer = () => {
  showDrawer.value = false;
  selectedReward.value = null;
  initialData.value = null;
};

const handleSave = async (data: Partial<Reward>) => {
  if (selectedReward.value) {
    await store.dispatch('rewards/updateReward', {
      id: selectedReward.value._id,
      data
    });
  } else {
    await store.dispatch('rewards/createReward', data);
  }
  closeDrawer();
  showTemplates.value = false; // Hide templates after saving
};

const openCreate = () => {
  initialData.value = null;
  showTemplates.value = false;
  showDrawer.value = true;
};

const selectTemplate = (t: { data: Partial<Reward> }) => {
  initialData.value = t.data;
  showDrawer.value = true;
};

// Watch auth state
watch(isAuthenticated, (newValue) => {
  if (!newValue) {
    router.push('/login');
  }
});

// Lifecycle
onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/login');
    return;
  }
  store.dispatch('rewards/fetchRewards');
});
</script>