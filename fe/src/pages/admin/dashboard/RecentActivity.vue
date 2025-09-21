<template>
  <div class="space-y-6">
    <div class="bg-white shadow rounded-lg">
      <div class="p-6">
        <h3 class="text-lg font-medium text-slate-900 mb-4">Recent Member Activity</h3>
        
        <div class="flow-root">
          <ul role="list" class="-mb-8">
            <li v-for="(activity, index) in activities" :key="activity.id">
              <div class="relative pb-8">
                <span v-if="index !== activities.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                <div class="relative flex space-x-3">
                  <div>
                    <span :class="[activity.iconBackground, 'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white']">
                      <component :is="activity.icon" class="h-5 w-5 text-white" aria-hidden="true" />
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-sm text-slate-500">
                        {{ activity.content }}
                        <a :href="activity.href" class="font-medium text-slate-900">
                          {{ activity.target }}
                        </a>
                      </p>
                    </div>
                    <div class="whitespace-nowrap text-right text-sm text-slate-500">
                      <time :datetime="activity.datetime">{{ activity.date }}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineComponent } from 'vue'

const CheckIcon = defineComponent({
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`
})

const UserIcon = defineComponent({
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`
})

const StarIcon = defineComponent({
  template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>`
})

const activities = ref([
  {
    id: 1,
    content: 'Completed challenge',
    target: 'Beer Explorer Level 1',
    href: '#',
    date: '3 min ago',
    datetime: '2024-01-23T11:00',
    icon: StarIcon,
    iconBackground: 'bg-amber-500'
  },
  {
    id: 2,
    content: 'Redeemed reward',
    target: 'Free Pint Glass',
    href: '#',
    date: '2 hours ago',
    datetime: '2024-01-23T09:00',
    icon: CheckIcon,
    iconBackground: 'bg-green-500'
  },
  {
    id: 3,
    content: 'New member joined',
    target: 'Sarah Wilson',
    href: '#',
    date: '4 hours ago',
    datetime: '2024-01-23T07:00',
    icon: UserIcon,
    iconBackground: 'bg-blue-500'
  },
  // Add more activities as needed
])
</script>
