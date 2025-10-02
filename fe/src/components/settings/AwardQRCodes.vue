<template>
  <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
    <div class="flex items-start justify-between mb-6">
      <div>
        <h4 class="text-lg font-semibold text-gray-900">Award Points QR Codes</h4>
        <div class="text-sm text-gray-600 mt-1 space-y-3">
          <template v-if="showFullDescription">
            <p v-for="(paragraph, index) in descriptionParagraphs" :key="index">
              {{ paragraph }}
            </p>
          </template>
          <template v-else>
            <p>{{ truncatedDescription }}</p>
          </template>
          <button
            type="button"
            class="text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none"
            @click="toggleDescription"
            :aria-expanded="showFullDescription"
          >
            {{ showFullDescription ? 'Read less' : 'Read more' }}
          </button>
        </div>
      </div>
      <button 
        class="btn btn-primary flex items-center gap-2" 
        @click="$emit('create')"
      >
        <Icon icon="mdi:plus" class="h-4 w-4" />
        New QR Code
      </button>
    </div>

    <div v-if="loading" class="py-12">
      <div class="flex justify-center items-center space-x-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span class="text-gray-500">Loading QR codes...</span>
      </div>
    </div>

    <div v-else-if="qrCodes.length === 0" class="py-12">
      <div class="text-center">
        <div class="text-gray-400 mb-3">
          <Icon icon="mdi:qrcode" class="h-12 w-12" />
        </div>
        <h3 class="text-gray-700 font-medium mb-2">No QR Codes Yet</h3>
        <p class="text-gray-500 text-sm">Create your first QR code to start awarding points.</p>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <div 
        v-for="qr in qrCodes" 
        :key="qr._id" 
        class="bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <div class="text-sm text-gray-500">Points Value</div>
            <div class="text-xl font-semibold text-gray-900">{{ qr.points }}</div>
          </div>
          <div class="flex items-center gap-1">
            <button 
              class="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              @click="$emit('edit', qr)"
              title="Edit"
            >
              <Icon icon="mdi:pencil" class="h-4 w-4" />
            </button>
            <button 
              class="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              @click="$emit('print', qr)"
              title="Print"
            >
              <Icon icon="mdi:printer" class="h-4 w-4" />
            </button>
            <button 
              class="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              @click="$emit('download', qr)"
              title="Download"
            >
              <Icon icon="mdi:download" class="h-4 w-4" />
            </button>
            <button 
              class="p-2 text-gray-500 hover:text-red-600 transition-colors"
              @click="confirmDelete(qr)"
              title="Delete"
            >
              <Icon icon="mdi:trash-can" class="h-4 w-4" />
            </button>
          </div>
        </div>
        <div class="text-xs text-gray-400 font-mono">Code: {{ qr.code }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  qrCodes: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['create', 'edit', 'print', 'download', 'delete']);

const descriptionParagraphs = [
  'Create and manage QR codes that automatically award points to members when scanned. These Award QR Codes serve as the official way to issue points, ensuring members can’t simply award points to themselves with a single tap. Because these codes have the authority to transfer points, it’s best to keep them out of sight and only present them at the right time—for example, after a purchase.',
  'You can also set a cool-down interval (default: 1 hour), which prevents the same member from scanning the same code again until the time has passed.',
  'Note: Award QR Codes also double as a member registration/login link. A customer can scan one to sign up or log in to their account, then scan again inside the app to collect points.',
  'This often raises the question: why not just use the same QR code as a public “Sign Up” code posted on the wall? The reason is that these codes also authorize point awards. That said, you’re free to use them however you like—if displayed publicly, they could serve as a “daily” points top-up for anyone visiting your venue (whether or not they make a purchase). In that case, you may want to set a longer cool-down interval, such as 24 hours.'
];

const showFullDescription = ref(false);

const truncateText = (text, maxLength = 160) => {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpaceIndex > 0 ? lastSpaceIndex : maxLength).trimEnd()}...`;
};

const truncatedDescription = computed(() => truncateText(descriptionParagraphs[0]));

const toggleDescription = () => {
  showFullDescription.value = !showFullDescription.value;
};

const confirmDelete = (qr) => {
  if (confirm(`Are you sure you want to delete this QR code with ${qr.points} points?`)) {
    emit('delete', qr);
  }
};
</script>
