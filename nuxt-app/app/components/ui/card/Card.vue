<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "~/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        interactive: "hover:shadow-lg transition-shadow cursor-pointer",
        elevated: "shadow-md hover:shadow-xl transition-shadow",
        flat: "shadow-none border-gray-200",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface CardProps
  extends /* @vue-ignore */ VariantProps<typeof cardVariants> {
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<CardProps>(), {
  variant: "default",
  size: "default",
});
</script>

<template>
  <div
    data-slot="card"
    :class="cn(cardVariants({ variant, size }), props.class)"
  >
    <slot />
  </div>
</template>
