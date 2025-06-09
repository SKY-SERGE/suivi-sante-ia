<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    @click="$emit('update:open', false)"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  open?: boolean;
}

defineProps<Props>();
defineEmits<{
  "update:open": [value: boolean];
}>();
</script>
