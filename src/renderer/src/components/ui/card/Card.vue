<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    :class="
      cn(
        'rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
