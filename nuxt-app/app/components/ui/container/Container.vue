<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "~/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const containerVariants = cva("", {
  variants: {
    size: {
      default: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
      sm: "max-w-4xl mx-auto px-4 sm:px-6",
      lg: "max-w-full mx-auto px-4 sm:px-6 lg:px-8",
      full: "w-full px-4 sm:px-6 lg:px-8",
      none: "",
    },
    spacing: {
      default: "py-6",
      sm: "py-4",
      lg: "py-8",
      xl: "py-12",
      none: "",
    },
  },
  defaultVariants: {
    size: "default",
    spacing: "default",
  },
});

export interface ContainerProps
  extends /* @vue-ignore */ VariantProps<typeof containerVariants> {
  class?: HTMLAttributes["class"];
  as?: string;
}

const props = withDefaults(defineProps<ContainerProps>(), {
  size: "default",
  spacing: "default",
  as: "div",
});
</script>

<template>
  <component
    :is="as"
    :class="cn(containerVariants({ size, spacing }), props.class)"
  >
    <slot />
  </component>
</template>
