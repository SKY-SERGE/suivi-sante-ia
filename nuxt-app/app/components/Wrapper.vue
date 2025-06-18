<template>
  <slot />
  <Toaster position="bottom-right" />
</template>

<script setup lang="ts">
import { Toaster } from "~/components/ui/sonner";
import { toast } from "vue-sonner";

const toastStore = useToastStore();

watch(
  () => [...toastStore.bus], // Create a new array reference for watching
  (newBus) => {
    if (newBus.length > 0) {
      // Process the bus items safely
      const toProcess = [...newBus];
      toastStore.clearBus();
      toProcess.forEach((toastEl) => {
        // Use markRaw to prevent Vue from making the toast object reactive
        toast(shallowRef(toastEl));
      });
    }
  },
  { immediate: true, deep: true }
);
</script>
