# Using Icons in BrewBucks

We use [@iconify/vue](https://iconify.design/) for our icon system. Iconify provides access to over 150,000 icons from 100+ icon sets including Material Design, Google Icons, FontAwesome, and many more.

## Quick Start

1. The package is already installed (`@iconify/vue`)

2. Import and use icons in your Vue components:
```vue
<script setup>
import { Icon } from '@iconify/vue'
</script>

<template>
  <Icon icon="mdi:beer" class="h-6 w-6 text-gray-500" />
</template>
```

## Finding Icons

1. Visit [Iconify Icon Sets](https://icon-sets.iconify.design/) to browse all available icons
2. Popular icon sets you can use:
   - Material Design: `mdi:icon-name`
   - Google Icons: `ic:icon-name`
   - FontAwesome: `fa6-solid:icon-name`
   - Bootstrap Icons: `bi:icon-name`
   - And many more!

## Icon Properties

```vue
<Icon 
  icon="mdi:beer"          // Icon name
  width="24"               // Width in pixels
  height="24"             // Height in pixels
  class="text-blue-500"   // CSS classes (color, etc)
  :rotate="90"           // Rotation in degrees
  :flip="horizontal"     // Flip icon (horizontal/vertical)
  :inline="true"        // Inline with text
/>
```

## Customizing Icons

1. Size: Use width/height props or Tailwind classes
```vue
<!-- Using props -->
<Icon icon="mdi:beer" width="24" height="24" />

<!-- Using Tailwind -->
<Icon icon="mdi:beer" class="h-6 w-6" />
```

2. Color: Use Tailwind's text-color classes
```vue
<Icon icon="mdi:beer" class="text-blue-500" /> <!-- Blue -->
<Icon icon="mdi:beer" class="text-gray-400" /> <!-- Gray -->
<Icon icon="mdi:beer" class="text-red-600" />  <!-- Red -->
```

3. Other styles:
```vue
<Icon icon="mdi:beer" rotate="90" />           <!-- Rotation -->
<Icon icon="mdi:beer" class="animate-spin" />  <!-- Animation -->
<Icon icon="mdi:beer" flip="horizontal" />     <!-- Flip -->
```

## Common Icon Collections

Here are some popular icon collections you can use:

### Material Design Icons (mdi)
```vue
<Icon icon="mdi:account" />         <!-- User account -->
<Icon icon="mdi:cog" />            <!-- Settings -->
<Icon icon="mdi:bell" />           <!-- Notification -->
```

### Google Icons (ic)
```vue
<Icon icon="ic:baseline-home" />    <!-- Home -->
<Icon icon="ic:outline-search" />   <!-- Search -->
<Icon icon="ic:round-add" />        <!-- Add -->
```

### FontAwesome 6 (fa6-solid)
```vue
<Icon icon="fa6-solid:user" />      <!-- User -->
<Icon icon="fa6-solid:gear" />      <!-- Settings -->
<Icon icon="fa6-solid:bell" />      <!-- Notification -->
```

## Example Usage

```vue
<script setup>
import { Icon } from '@iconify/vue'
</script>

<template>
  <div class="flex gap-4">
    <!-- Navigation icon -->
    <Icon 
      icon="mdi:account" 
      class="h-6 w-6 text-gray-500 hover:text-gray-700" 
    />
    
    <!-- Settings icon -->
    <Icon 
      icon="mdi:cog" 
      class="h-6 w-6 text-gray-500" 
    />
    
    <!-- Notification with badge -->
    <div class="relative">
      <Icon 
        icon="mdi:bell" 
        class="h-6 w-6 text-gray-500" 
      />
      <Icon 
        icon="mdi:check-circle" 
        class="absolute -top-1 -right-1 h-4 w-4 text-green-500" 
      />
    </div>
  </div>
</template>
```

## Best Practices

1. Keep icon sizes consistent throughout similar UI elements
2. Use semantic colors from our design system
3. Choose icons from the same collection for consistency
4. Consider using Material Design Icons (mdi) as our primary icon set for consistency
5. Use the [Iconify Explorer](https://icon-sets.iconify.design/) to find the perfect icons
6. Include meaningful alt text or aria-label for accessibility when icons are used as buttons

## Performance Tips

1. Icons are loaded on-demand, so there's no need to import them separately
2. Use consistent icon sets to improve caching
3. Specify width and height to prevent layout shifts
4. Use the inline prop when mixing icons with text to improve alignment

Remember to check the [official Iconify documentation](https://docs.iconify.design/icon-components/vue/) for the most up-to-date information and complete API reference.