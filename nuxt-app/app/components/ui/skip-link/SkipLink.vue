<script setup lang="ts">
import { cn } from "~/lib/utils";

interface Props {
  href?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  href: "#main-content",
});
</script>

<template>
  <a
    :href="href"
    :class="
      cn(
        'absolute left-0 top-0 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-br-md font-medium',
        'transform -translate-y-full transition-transform',
        'focus:translate-y-0',
        'sr-only focus:not-sr-only',
        props.class
      )
    "
  >
    <slot> Aller au contenu principal </slot>
  </a>
</template>
